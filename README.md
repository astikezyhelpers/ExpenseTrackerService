# Expense Tracker Service - Low Level Design

## Table of Contents
1. [Service Overview](#service-overview)
2. [Architecture Components](#architecture-components)
3. [Detailed System Architecture](#detailed-system-architecture)
4. [API Design](#api-design)
5. [Database Design](#database-design)
6. [Component Design](#component-design)
7. [Integration Patterns](#integration-patterns)
8. [Error Handling & Validation](#error-handling--validation)
9. [Security Design](#security-design)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring & Observability](#monitoring--observability)

## Service Overview

### Service Details
- **Service Name**: Expense Tracker Service
- **Port**: 3007
- **Technology Stack**: Node.js + Express.js / Python + FastAPI
- **Primary Database**: PostgreSQL
- **Secondary Storage**: File Storage (AWS S3/Google Cloud Storage)
- **Cache**: Redis
- **Message Queue**: RabbitMQ/Kafka

### Core Responsibilities
- Expense recording and management
- Receipt processing using OCR technology
- Expense categorization and validation
- Reporting and analytics generation
- Integration with Wallet Service for budget validation
- Audit trail maintenance

## Architecture Components

### High-Level Component Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXPENSE TRACKER SERVICE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │   Controller    │    │   Middleware    │    │   Validation    │    │
│  │   Layer         │    │   Layer         │    │   Layer         │    │
│  │                 │    │                 │    │                 │    │
│  │ - ExpenseCtrl   │    │ - Auth Check    │    │ - Input Valid   │    │
│  │ - ReportCtrl    │    │ - Rate Limit    │    │ - Business Rules│    │
│  │ - ReceiptCtrl   │    │ - Logging       │    │ - Schema Valid  │    │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│           │                       │                       │             │
│           └───────────────────────┼───────────────────────┘             │
│                                   │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                    SERVICE LAYER                                  │  │
│  ├─────────────────────────────────┼─────────────────────────────────┤  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐ │  │
│  │  │  Expense        │    │  Receipt        │    │  Report       │ │  │
│  │  │  Service        │    │  Service        │    │  Service      │ │  │
│  │  │                 │    │                 │    │               │ │  │
│  │  │ - Create        │    │ - OCR Process   │    │ - Generate    │ │  │
│  │  │ - Update        │    │ - Extract Data  │    │ - Aggregate   │ │  │
│  │  │ - Validate      │    │ - Store Files   │    │ - Export      │ │  │
│  │  │ - Categorize    │    │ - Validate      │    │ - Analytics   │ │  │
│  │  └─────────────────┘    └─────────────────┘    └───────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                  REPOSITORY LAYER                                 │  │
│  ├─────────────────────────────────┼─────────────────────────────────┤  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐ │  │
│  │  │  Expense        │    │  Receipt        │    │  Category     │ │  │
│  │  │  Repository     │    │  Repository     │    │  Repository   │ │  │
│  │  │                 │    │                 │    │               │ │  │
│  │  │ - CRUD Ops      │    │ - File Ops      │    │ - Master Data │ │  │
│  │  │ - Query Builder │    │ - Metadata      │    │ - Lookup      │ │  │
│  │  │ - Transactions  │    │ - Search        │    │ - Validation  │ │  │
│  │  └─────────────────┘    └─────────────────┘    └───────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                   INTEGRATION LAYER                               │  │
│  ├─────────────────────────────────┼─────────────────────────────────┤  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐ │  │
│  │  │  OCR            │    │  Event          │    │  External     │ │  │
│  │  │  Integration    │    │  Publisher      │    │  API Client   │ │  │
│  │  │                 │    │                 │    │               │ │  │
│  │  │ - AWS Textract  │    │ - Kafka/RabbitMQ│    │ - Wallet API  │ │  │
│  │  │ - Google Vision │    │ - Event Schema  │    │ - User API    │ │  │
│  │  │ - Azure OCR     │    │ - Retry Logic   │    │ - Notify API  │ │  │
│  │  └─────────────────┘    └─────────────────┘    └───────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                     DATA LAYER                                    │  │
│  ├─────────────────────────────────┼─────────────────────────────────┤  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐ │  │
│  │  │  PostgreSQL     │    │  File Storage   │    │  Redis Cache  │ │  │
│  │  │  Database       │    │  (S3/GCS)       │    │               │ │  │
│  │  │                 │    │                 │    │               │ │  │
│  │  │ - Expense Data  │    │ - Receipt Files │    │ - Session     │ │  │
│  │  │ - Categories    │    │ - OCR Results   │    │ - Query Cache │ │  │
│  │  │ - Audit Logs    │    │ - Documents     │    │ - Rate Limits │ │  │
│  │  └─────────────────┘    └─────────────────┘    └───────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed System Architecture

### Service Internal Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXPENSE CREATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  API Request                                                           │
│      │                                                                 │
│      ▼                                                                 │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │   Request       │──────│   Authentication│──────│   Input         │ │
│  │   Validation    │      │   & Authorization│      │   Sanitization  │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │   Business      │──────│   Budget        │──────│   Category      │ │
│  │   Rules Check   │      │   Validation    │      │   Assignment    │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │   Database      │──────│   Event         │──────│   Response      │ │
│  │   Transaction   │      │   Publishing    │      │   Generation    │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Receipt Processing Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RECEIPT PROCESSING FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Receipt Upload                                                        │
│      │                                                                 │
│      ▼                                                                 │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │   File          │──────│   Virus/Malware │──────│   File Type     │ │
│  │   Upload        │      │   Scanning      │      │   Validation    │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │   File Storage  │──────│   OCR           │──────│   Data          │ │
│  │   (S3/GCS)      │      │   Processing    │      │   Extraction    │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │   Data          │──────│   Confidence    │──────│   Manual        │ │
│  │   Validation    │      │   Score Check   │      │   Review Queue  │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐      ┌─────────────────┐                         │
│  │   Expense       │──────│   Notification  │                         │
│  │   Auto-Creation │      │   to User       │                         │
│  └─────────────────┘      └─────────────────┘                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## API Design

### RESTful API Endpoints

#### Expense Management APIs
```
POST   /api/v1/expenses                    # Create new expense
GET    /api/v1/expenses                    # List user expenses (with pagination)
GET    /api/v1/expenses/{expenseId}        # Get specific expense
PUT    /api/v1/expenses/{expenseId}        # Update expense
DELETE /api/v1/expenses/{expenseId}        # Delete expense
PATCH  /api/v1/expenses/{expenseId}/status # Update expense status
```

#### Receipt Management APIs
```
POST   /api/v1/expenses/{expenseId}/receipt     # Upload receipt
GET    /api/v1/expenses/{expenseId}/receipt     # Get receipt details
DELETE /api/v1/expenses/{expenseId}/receipt     # Delete receipt
POST   /api/v1/receipts/ocr                     # Process receipt OCR
GET    /api/v1/receipts/{receiptId}/status      # Get OCR processing status
```

#### Reporting APIs
```
GET    /api/v1/expenses/reports/summary         # Get expense summary
GET    /api/v1/expenses/reports/detailed        # Get detailed report
POST   /api/v1/expenses/reports/export          # Export expenses
GET    /api/v1/expenses/analytics/dashboard     # Dashboard analytics
GET    /api/v1/expenses/analytics/trends        # Spending trends
```

#### Category Management APIs
```
GET    /api/v1/expenses/categories              # Get available categories
POST   /api/v1/expenses/categories              # Create custom category
PUT    /api/v1/expenses/categories/{categoryId} # Update category
DELETE /api/v1/expenses/categories/{categoryId} # Delete category
```

### API Request/Response Schemas

#### Create Expense Request
```json
{
  "title": "Business Lunch",
  "description": "Team meeting at restaurant",
  "amount": 150.00,
  "currency": "USD",
  "categoryId": "cat_001",
  "subcategoryId": "sub_cat_003",
  "date": "2025-07-21T12:30:00Z",
  "merchant": "Restaurant XYZ",
  "location": {
    "city": "New York",
    "country": "USA",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "tags": ["business", "team", "lunch"],
  "attendees": ["john@company.com", "jane@company.com"],
  "projectId": "proj_123",
  "billable": true,
  "receipt": {
    "hasReceipt": true,
    "receiptUrl": "https://storage.example.com/receipts/receipt_001.jpg"
  }
}
```

#### Expense Response Schema
```json
{
  "success": true,
  "data": {
    "expenseId": "exp_001",
    "userId": "user_123",
    "companyId": "comp_456",
    "title": "Business Lunch",
    "description": "Team meeting at restaurant",
    "amount": 150.00,
    "currency": "USD",
    "category": {
      "id": "cat_001",
      "name": "Meals & Entertainment",
      "subcategory": {
        "id": "sub_cat_003",
        "name": "Business Meals"
      }
    },
    "date": "2025-07-21T12:30:00Z",
    "merchant": "Restaurant XYZ",
    "location": {
      "city": "New York",
      "country": "USA",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "status": "pending",
    "approvalStatus": "pending_approval",
    "receipt": {
      "id": "receipt_001",
      "url": "https://storage.example.com/receipts/receipt_001.jpg",
      "ocrStatus": "completed",
      "extractedData": {
        "total": 150.00,
        "tax": 12.00,
        "date": "2025-07-21",
        "merchant": "Restaurant XYZ"
      }
    },
    "auditTrail": {
      "createdAt": "2025-07-21T12:35:00Z",
      "createdBy": "user_123",
      "lastModifiedAt": "2025-07-21T12:35:00Z",
      "lastModifiedBy": "user_123"
    }
  },
  "meta": {
    "requestId": "req_789",
    "timestamp": "2025-07-21T12:35:00Z"
  }
}
```

## Database Design

### PostgreSQL Schema

#### Main Tables Schema
```sql
-- Expenses Table
CREATE TABLE expenses (
    expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category_id UUID NOT NULL,
    subcategory_id UUID,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
    merchant VARCHAR(255),
    location JSONB,
    tags TEXT[],
    attendees TEXT[],
    project_id UUID,
    billable BOOLEAN DEFAULT FALSE,
    status expense_status DEFAULT 'draft',
    approval_status approval_status DEFAULT 'pending',
    approval_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,
    
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES expense_categories(category_id),
    CONSTRAINT fk_expense_subcategory FOREIGN KEY (subcategory_id) REFERENCES expense_subcategories(subcategory_id)
);

-- Receipt Table
CREATE TABLE receipts (
    receipt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    storage_provider VARCHAR(50) NOT NULL,
    ocr_status ocr_status DEFAULT 'pending',
    ocr_confidence_score DECIMAL(3,2),
    extracted_data JSONB,
    ocr_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_receipt_expense FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE
);

-- Expense Categories
CREATE TABLE expense_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_category BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_category_name_company UNIQUE (name, company_id)
);

-- Expense Subcategories
CREATE TABLE expense_subcategories (
    subcategory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES expense_categories(category_id)
);

-- Expense Audit Log
CREATE TABLE expense_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT fk_audit_expense FOREIGN KEY (expense_id) REFERENCES expenses(expense_id)
);
```

#### Enums and Types
```sql
-- Custom Types
CREATE TYPE expense_status AS ENUM (
    'draft',
    'submitted',
    'approved',
    'rejected',
    'reimbursed',
    'cancelled'
);

CREATE TYPE approval_status AS ENUM (
    'pending',
    'pending_approval',
    'approved',
    'rejected',
    'auto_approved'
);

CREATE TYPE ocr_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'manual_review_required'
);
```

#### Database Indexes
```sql
-- Performance Indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_company_id ON expenses(company_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_approval_status ON expenses(approval_status);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- Composite Indexes
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_company_status ON expenses(company_id, status);
CREATE INDEX idx_expenses_approval_queue ON expenses(approval_status, created_at) WHERE approval_status = 'pending_approval';

-- JSONB Indexes
CREATE INDEX idx_expenses_location ON expenses USING GIN (location);
CREATE INDEX idx_receipts_extracted_data ON receipts USING GIN (extracted_data);

-- Text Search Index
CREATE INDEX idx_expenses_search ON expenses USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(merchant, '')));
```

## Component Design

### Core Service Components

#### Expense Service Component
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXPENSE SERVICE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PUBLIC METHODS                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  + createExpense(userId, expenseData)                          │   │
│  │  + updateExpense(expenseId, updateData, userId)                │   │
│  │  + getExpense(expenseId, userId)                               │   │
│  │  + listExpenses(userId, filters, pagination)                   │   │
│  │  + deleteExpense(expenseId, userId)                            │   │
│  │  + submitExpense(expenseId, userId)                            │   │
│  │  + approveExpense(expenseId, approverId)                       │   │
│  │  + rejectExpense(expenseId, approverId, reason)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PRIVATE METHODS                              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  - validateExpenseData(expenseData)                            │   │
│  │  - validateBudgetLimits(userId, amount)                        │   │
│  │  - categorizeExpense(expenseData)                              │   │
│  │  - applyBusinessRules(expenseData)                             │   │
│  │  - publishExpenseEvent(eventType, expenseData)                 │   │
│  │  - logAuditTrail(expenseId, action, oldData, newData)          │   │
│  │  - sendNotification(recipients, notificationType, data)        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DEPENDENCIES                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  - ExpenseRepository                                           │   │
│  │  - CategoryRepository                                          │   │
│  │  - WalletServiceClient                                         │   │
│  │  - EventPublisher                                              │   │
│  │  - NotificationService                                         │   │
│  │  - AuditLogger                                                 │   │
│  │  - ValidationService                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Receipt Processing Component
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     RECEIPT SERVICE                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PUBLIC METHODS                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  + uploadReceipt(expenseId, file, userId)                      │   │
│  │  + processReceiptOCR(receiptId)                                 │   │
│  │  + getReceiptStatus(receiptId)                                  │   │
│  │  + getExtractedData(receiptId)                                  │   │
│  │  + deleteReceipt(receiptId, userId)                            │   │
│  │  + manualReviewReceipt(receiptId, reviewData)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PRIVATE METHODS                              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  - validateFileType(file)                                      │   │
│  │  - validateFileSize(file)                                      │   │
│  │  - scanForMalware(file)                                        │   │
│  │  - uploadToStorage(file, path)                                 │   │
│  │  - callOCRService(fileUrl)                                     │   │
│  │  - parseOCRResponse(ocrResponse)                                │   │
│  │  - validateExtractedData(extractedData)                        │   │
│  │  - calculateConfidenceScore(ocrData)                           │   │
│  │  - queueForManualReview(receiptId)                             │   │
│  │  - updateReceiptStatus(receiptId, status)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DEPENDENCIES                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  - ReceiptRepository                                           │   │
│  │  - FileStorageService                                          │   │
│  │  - OCRServiceClient                                            │   │
│  │  - MalwareScannerService                                       │   │
│  │  - EventPublisher                                              │   │
│  │  - NotificationService                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Integration Patterns

### Event-Driven Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EVENT PUBLISHING PATTERNS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Expense Created Event                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Topic: expense.created                                         │   │
│  │  Schema: {                                                      │   │
│  │    "eventId": "evt_001",                                        │   │
│  │    "eventType": "expense.created",                              │   │
│  │    "timestamp": "2025-07-21T12:35:00Z",                        │   │
│  │    "version": "1.0",                                            │   │
│  │    "data": {                                                    │   │
│  │      "expenseId": "exp_001",                                    │   │
│  │      "userId": "user_123",                                      │   │
│  │      "companyId": "comp_456",                                   │   │
│  │      "amount": 150.00,                                          │   │
│  │      "currency": "USD",                                         │   │
│  │      "categoryId": "cat_001",                                   │   │
│  │      "status": "submitted"                                      │   │
│  │    }                                                            │   │
│  │  }                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Receipt Processed Event                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Topic: receipt.processed                                       │   │
│  │  Schema: {                                                      │   │
│  │    "eventId": "evt_002",                                        │   │
│  │    "eventType": "receipt.processed",                            │   │
│  │    "timestamp": "2025-07-21T12:40:00Z",                        │   │
│  │    "version": "1.0",                                            │   │
│  │    "data": {                                                    │   │
│  │      "receiptId": "receipt_001",                                │   │
│  │      "expenseId": "exp_001",                                    │   │
│  │      "ocrStatus": "completed",                                  │   │
│  │      "confidenceScore": 0.95,                                   │   │
│  │      "extractedData": {                                         │   │
│  │        "total": 150.00,                                         │   │
│  │        "tax": 12.00,                                            │   │
│  │        "merchant": "Restaurant XYZ",                            │   │
│  │        "date": "2025-07-21"                                     │   │
│  │      }                                                          │   │
│  │    }                                                            │   │
│  │  }                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Expense Status Changed Event                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Topic: expense.status_changed                                  │   │
│  │  Schema: {                                                      │   │
│  │    "eventId": "evt_003",                                        │   │
│  │    "eventType": "expense.status_changed",                       │   │
│  │    "timestamp": "2025-07-21T13:00:00Z",                        │   │
│  │    "version": "1.0",                                            │   │
│  │    "data": {                                                    │   │
│  │      "expenseId": "exp_001",                                    │   │
│  │      "userId": "user_123",                                      │   │
│  │      "oldStatus": "submitted",                                  │   │
│  │      "newStatus": "approved",                                   │   │
│  │      "approvedBy": "manager_456",                               │   │
│  │      "approvalDate": "2025-07-21T13:00:00Z"                    │   │
│  │    }                                                            │   │
│  │  }                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### External Service Integration
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICE CLIENTS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Wallet Service Integration                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Base URL: http://wallet-service:3003                          │   │
│  │  Endpoints:                                                     │   │
│  │    GET /wallets/{userId}/balance                                │   │
│  │    POST /wallets/{userId}/validate-expense                      │   │
│  │    POST /wallets/{userId}/deduct                                │   │
│  │                                                                 │   │
│  │  Circuit Breaker Configuration:                                 │   │
│  │    - Failure Threshold: 5                                      │   │
│  │    - Recovery Timeout: 30s                                     │   │
│  │    - Fallback: Cache last known balance                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  User Service Integration                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Base URL: http://user-service:3001                            │   │
│  │  Endpoints:                                                     │   │
│  │    GET /users/{userId}/profile                                  │   │
│  │    GET /users/{userId}/manager                                  │   │
│  │    GET /users/{userId}/permissions                              │   │
│  │                                                                 │   │
│  │  Circuit Breaker Configuration:                                 │   │
│  │    - Failure Threshold: 3                                      │   │
│  │    - Recovery Timeout: 20s                                     │   │
│  │    - Fallback: Basic user info from JWT token                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Notification Service Integration                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Base URL: http://notification-service:3008                    │   │
│  │  Endpoints:                                                     │   │
│  │    POST /notifications/send                                     │   │
│  │    POST /notifications/bulk-send                                │   │
│  │                                                                 │   │
│  │  Retry Configuration:                                           │   │
│  │    - Max Retries: 3                                            │   │
│  │    - Backoff Strategy: Exponential                             │   │
│  │    - Timeout: 5s                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### OCR Service Integration
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      OCR SERVICE INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Multi-Provider OCR Strategy                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Primary: AWS Textract                                         │   │
│  │  Secondary: Google Cloud Vision API                            │   │
│  │  Fallback: Azure Computer Vision                               │   │
│  │                                                                 │   │
│  │  Provider Selection Logic:                                      │   │
│  │  - AWS Textract: Default for receipts and invoices             │   │
│  │  - Google Vision: For handwritten receipts                     │   │
│  │  - Azure Vision: Fallback when others fail                     │   │
│  │                                                                 │   │
│  │  Processing Pipeline:                                           │   │
│  │  1. Image preprocessing (resize, rotate, enhance)              │   │
│  │  2. OCR provider selection based on document type              │   │
│  │  3. Text extraction and confidence scoring                     │   │
│  │  4. Data parsing and validation                                │   │
│  │  5. Manual review queue for low confidence results             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  OCR Response Processing                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Standard Response Format:                                      │   │
│  │  {                                                              │   │
│  │    "success": true,                                             │   │
│  │    "provider": "aws_textract",                                  │   │
│  │    "confidence": 0.95,                                          │   │
│  │    "extractedData": {                                           │   │
│  │      "merchant": "Restaurant XYZ",                              │   │
│  │      "date": "2025-07-21",                                      │   │
│  │      "total": 150.00,                                           │   │
│  │      "subtotal": 138.00,                                        │   │
│  │      "tax": 12.00,                                              │   │
│  │      "currency": "USD",                                         │   │
│  │      "items": [                                                 │   │
│  │        {"name": "Pasta", "price": 25.00, "quantity": 2},       │   │
│  │        {"name": "Wine", "price": 88.00, "quantity": 1}         │   │
│  │      ],                                                         │   │
│  │      "paymentMethod": "Credit Card"                             │   │
│  │    },                                                           │   │
│  │    "rawText": "...",                                            │   │
│  │    "processingTime": 2.5                                        │   │
│  │  }                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Error Handling & Validation

### Validation Rules
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VALIDATION FRAMEWORK                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Input Validation Rules                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Expense Data Validation:                                       │   │
│  │  - Title: Required, 3-255 characters, no special characters    │   │
│  │  - Amount: Required, positive number, max 2 decimal places     │   │
│  │  - Currency: Required, valid ISO 4217 currency code            │   │
│  │  - Date: Required, not future date, within 90 days             │   │
│  │  - Category: Required, valid category ID                       │   │
│  │  - Description: Optional, max 1000 characters                  │   │
│  │  - Merchant: Optional, max 255 characters                      │   │
│  │  - Tags: Optional, array of strings, max 10 tags               │   │
│  │                                                                 │   │
│  │  Receipt File Validation:                                       │   │
│  │  - File Type: PDF, JPG, PNG, TIFF only                        │   │
│  │  - File Size: Max 10MB                                         │   │
│  │  - Image Resolution: Min 300 DPI for OCR                       │   │
│  │  - Virus Scan: Must pass malware detection                     │   │
│  │                                                                 │   │
│  │  Business Rule Validation:                                      │   │
│  │  - Budget Limit: Amount within user's available budget         │   │
│  │  - Company Policy: Adheres to company expense policies         │   │
│  │  - Duplicate Check: No duplicate expenses within 24 hours      │   │
│  │  - Category Rules: Valid category for user's role/department   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Error Response Standards                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Standard Error Response:                                       │   │
│  │  {                                                              │   │
│  │    "success": false,                                            │   │
│  │    "error": {                                                   │   │
│  │      "code": "VALIDATION_ERROR",                                │   │
│  │      "message": "Invalid expense data provided",                │   │
│  │      "details": [                                               │   │
│  │        {                                                        │   │
│  │          "field": "amount",                                     │   │
│  │          "code": "INVALID_AMOUNT",                              │   │
│  │          "message": "Amount must be positive",                  │   │
│  │          "value": -50.00                                        │   │
│  │        },                                                       │   │
│  │        {                                                        │   │
│  │          "field": "date",                                       │   │
│  │          "code": "FUTURE_DATE",                                 │   │
│  │          "message": "Expense date cannot be in the future",     │   │
│  │          "value": "2025-08-01"                                  │   │
│  │        }                                                        │   │
│  │      ]                                                          │   │
│  │    },                                                           │   │
│  │    "meta": {                                                    │   │
│  │      "requestId": "req_789",                                    │   │
│  │      "timestamp": "2025-07-21T12:35:00Z"                       │   │
│  │    }                                                            │   │
│  │  }                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Exception Handling Strategy
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXCEPTION HANDLING PATTERNS                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Exception Hierarchy                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  BaseException                                                  │   │
│  │  ├── ValidationException                                        │   │
│  │  │   ├── InvalidExpenseDataException                           │   │
│  │  │   ├── InvalidReceiptException                               │   │
│  │  │   └── BusinessRuleViolationException                        │   │
│  │  ├── AuthorizationException                                     │   │
│  │  │   ├── InsufficientPermissionsException                      │   │
│  │  │   └── BudgetExceededException                               │   │
│  │  ├── ExternalServiceException                                   │   │
│  │  │   ├── WalletServiceException                                │   │
│  │  │   ├── OCRServiceException                                   │   │
│  │  │   └── NotificationServiceException                          │   │
│  │  ├── DataException                                              │   │
│  │  │   ├── ExpenseNotFoundException                              │   │
│  │  │   ├── DatabaseConnectionException                           │   │
│  │  │   └── DataIntegrityException                                │   │
│  │  └── SystemException                                            │   │
│  │      ├── FileStorageException                                  │   │
│  │      └── InternalServerException                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Error Handling Middleware                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Global Error Handler:                                          │   │
│  │  1. Log error with full context                                 │   │
│  │  2. Sanitize error message for client                          │   │
│  │  3. Map internal errors to appropriate HTTP status codes       │   │
│  │  4. Generate correlation ID for tracking                       │   │
│  │  5. Send alert for critical errors                             │   │
│  │  6. Return standardized error response                         │   │
│  │                                                                 │   │
│  │  Retry Logic:                                                   │   │
│  │  - External Service Calls: 3 retries with exponential backoff │   │
│  │  - Database Operations: 2 retries for transient errors        │   │
│  │  - File Operations: 2 retries with delay                      │   │
│  │                                                                 │   │
│  │  Circuit Breaker:                                               │   │
│  │  - Open circuit after 5 consecutive failures                  │   │
│  │  - Half-open after 30 seconds                                 │   │
│  │  - Reset after successful call                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Security Design

### Authentication & Authorization
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  JWT Token Validation                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Token Structure:                                               │   │
│  │  {                                                              │   │
│  │    "header": {                                                  │   │
│  │      "alg": "RS256",                                            │   │
│  │      "typ": "JWT"                                               │   │
│  │    },                                                           │   │
│  │    "payload": {                                                 │   │
│  │      "sub": "user_123",                                         │   │
│  │      "companyId": "comp_456",                                   │   │
│  │      "roles": ["employee", "expense_submitter"],               │   │
│  │      "permissions": ["expense:create", "expense:read"],         │   │
│  │      "iat": 1721567700,                                         │   │
│  │      "exp": 1721654100                                          │   │
│  │    }                                                            │   │
│  │  }                                                              │   │
│  │                                                                 │   │
│  │  Validation Rules:                                              │   │
│  │  - Signature verification using public key                     │   │
│  │  - Expiration time check                                       │   │
│  │  - Issuer validation                                           │   │
│  │  - Token blacklist check                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Permission-Based Access Control                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Resource Permissions:                                          │   │
│  │                                                                 │   │
│  │  Expense Operations:                                            │   │
│  │  - expense:create      → Create new expense                    │   │
│  │  - expense:read        → Read own expenses                     │   │
│  │  - expense:update      → Update own expenses                   │   │
│  │  - expense:delete      → Delete own expenses                   │   │
│  │  - expense:submit      → Submit for approval                   │   │
│  │                                                                 │   │
│  │  Manager Operations:                                            │   │
│  │  - expense:read_team   → Read team expenses                    │   │
│  │  - expense:approve     → Approve team expenses                 │   │
│  │  - expense:reject      → Reject team expenses                  │   │
│  │                                                                 │   │
│  │  Admin Operations:                                              │   │
│  │  - expense:read_all    → Read all company expenses             │   │
│  │  - expense:manage_all  → Manage all expenses                   │   │
│  │  - category:manage     → Manage expense categories             │   │
│  │                                                                 │   │
│  │  Authorization Middleware:                                      │   │
│  │  1. Extract JWT token from Authorization header                │   │
│  │  2. Validate token signature and expiration                    │   │
│  │  3. Check required permissions for requested operation         │   │
│  │  4. Validate resource ownership (for user-specific resources)  │   │
│  │  5. Allow or deny request based on authorization result        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Protection
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA PROTECTION MEASURES                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Sensitive Data Handling                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Data Classification:                                           │   │
│  │  - Public: Category names, currency codes                      │   │
│  │  - Internal: Expense amounts, dates, merchants                 │   │
│  │  - Confidential: Receipt images, personal notes                │   │
│  │  - Restricted: Bank account details, SSNs                      │   │
│  │                                                                 │   │
│  │  Encryption Standards:                                          │   │
│  │  - Data at Rest: AES-256 encryption for database              │   │
│  │  - Data in Transit: TLS 1.3 for all API communications        │   │
│  │  - File Storage: Server-side encryption with managed keys     │   │
│  │  - Sensitive Fields: Application-level encryption              │   │
│  │                                                                 │   │
│  │  PII Handling:                                                  │   │
│  │  - Data Minimization: Collect only necessary information      │   │
│  │  - Anonymization: Remove PII from analytics data              │   │
│  │  - Right to Deletion: Support GDPR deletion requests          │   │
│  │  - Data Retention: Automatic purging after retention period   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Input Sanitization & Validation                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  SQL Injection Prevention:                                      │   │
│  │  - Parameterized queries only                                  │   │
│  │  - Input validation with whitelisting                          │   │
│  │  - Query result size limits                                    │   │
│  │                                                                 │   │
│  │  XSS Prevention:                                                │   │
│  │  - HTML encoding of user inputs                                │   │
│  │  - Content Security Policy headers                             │   │
│  │  - Input validation with regex patterns                        │   │
│  │                                                                 │   │
│  │  File Upload Security:                                          │   │
│  │  - File type validation with magic number checking             │   │
│  │  - Antivirus scanning for all uploaded files                  │   │
│  │  - File size limits and rate limiting                          │   │
│  │  - Quarantine suspicious files                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Performance Optimization

### Caching Strategy
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CACHING ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Multi-Level Caching                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  L1 Cache - Application Memory (Node.js)                       │   │
│  │  - Category lookup data (1 hour TTL)                           │   │
│  │  - Company policies (30 minutes TTL)                           │   │
│  │  - User permissions (15 minutes TTL)                           │   │
│  │  - Exchange rates (5 minutes TTL)                              │   │
│  │                                                                 │   │
│  │  L2 Cache - Redis                                               │   │
│  │  - User session data (24 hours TTL)                            │   │
│  │  - Frequently accessed expenses (1 hour TTL)                   │   │
│  │  - OCR results (7 days TTL)                                    │   │
│  │  - Report data (30 minutes TTL)                                │   │
│  │  - Database query results (15 minutes TTL)                     │   │
│  │                                                                 │   │
│  │  L3 Cache - CDN                                                 │   │
│  │  - Receipt images (30 days TTL)                                │   │
│  │  - Static assets (1 year TTL)                                  │   │
│  │  - API documentation (1 day TTL)                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Cache Invalidation Strategies                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Event-Based Invalidation:                                      │   │
│  │  - Expense updated → Invalidate user expense cache              │   │
│  │  - Category changed → Invalidate category cache                │   │
│  │  - Policy updated → Invalidate policy cache                    │   │
│  │                                                                 │   │
│  │  Time-Based Invalidation:                                       │   │
│  │  - Short TTL for frequently changing data                      │   │
│  │  - Long TTL for static reference data                          │   │
│  │                                                                 │   │
│  │  Manual Invalidation:                                           │   │
│  │  - Admin cache flush endpoints                                 │   │
│  │  - Deployment-triggered cache clear                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Optimization
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE OPTIMIZATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Query Optimization Patterns                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Index Strategy:                                                │   │
│  │  - Single-column indexes on frequently filtered columns         │   │
│  │  - Composite indexes for multi-column queries                   │   │
│  │  - Partial indexes for specific conditions                      │   │
│  │  - JSONB indexes for flexible document queries                  │   │
│  │                                                                 │   │
│  │  Query Patterns:                                                │   │
│  │  - Use LIMIT and OFFSET for pagination                         │   │
│  │  - Aggregate queries with appropriate GROUP BY                 │   │
│  │  - Subqueries optimization with CTEs                           │   │
│  │  - Join optimization with proper index usage                   │   │
│  │                                                                 │   │
│  │  Connection Pooling:                                            │   │
│  │  - Pool Size: 10-20 connections per service instance           │   │
│  │  - Connection Timeout: 30 seconds                              │   │
│  │  - Idle Timeout: 300 seconds                                   │   │
│  │  - Max Lifetime: 3600 seconds                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Data Partitioning Strategy                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Table Partitioning:                                            │   │
│  │  - Expenses table partitioned by month                         │   │
│  │  - Audit logs partitioned by quarter                           │   │
│  │  - Receipt files partitioned by year                           │   │
│  │                                                                 │   │
│  │  Read Replicas:                                                 │   │
│  │  - Reporting queries → Read replica                            │   │
│  │  - Analytics queries → Separate analytics database             │   │
│  │  - Write operations → Primary database only                    │   │
│  │                                                                 │   │
│  │  Archive Strategy:                                              │   │
│  │  - Move expenses older than 7 years to archive storage         │   │
│  │  - Compress old receipt files                                  │   │
│  │  - Maintain audit trail for compliance                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```