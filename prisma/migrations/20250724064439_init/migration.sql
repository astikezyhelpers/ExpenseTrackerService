-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED');

-- CreateEnum
CREATE TYPE "OCRStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW_REQUIRED');

-- CreateTable
CREATE TABLE "expenses" (
    "expense_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "category_id" TEXT NOT NULL,
    "expense_date" TIMESTAMPTZ(6) NOT NULL,
    "merchant" TEXT,
    "attendees" TEXT[],
    "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "receipt_url" TEXT,
    "approval_metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "receipt_id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "ocr_status" "OCRStatus" NOT NULL DEFAULT 'PENDING',
    "ocr_confidence_score" DECIMAL(3,2),
    "extracted_data" JSONB,
    "ocr_processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("receipt_id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "category_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "spend_limit" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "expense_audit_log" (
    "audit_id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" INET,
    "user_agent" TEXT,

    CONSTRAINT "expense_audit_log_pkey" PRIMARY KEY ("audit_id")
);

-- CreateIndex
CREATE INDEX "idx_expenses_user_id" ON "expenses"("user_id");

-- CreateIndex
CREATE INDEX "idx_expenses_company_id" ON "expenses"("company_id");

-- CreateIndex
CREATE INDEX "idx_expenses_date" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "idx_expenses_status" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "idx_expenses_approval_status" ON "expenses"("approval_status");

-- CreateIndex
CREATE INDEX "idx_expenses_category" ON "expenses"("category_id");

-- CreateIndex
CREATE INDEX "idx_expenses_created_at" ON "expenses"("created_at");

-- CreateIndex
CREATE INDEX "idx_expenses_user_date" ON "expenses"("user_id", "expense_date" DESC);

-- CreateIndex
CREATE INDEX "idx_expenses_company_status" ON "expenses"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_name_company_id_key" ON "expense_categories"("name", "company_id");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("expense_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_audit_log" ADD CONSTRAINT "expense_audit_log_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("expense_id") ON DELETE RESTRICT ON UPDATE CASCADE;
