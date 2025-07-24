export const mockAuth = (req,res,next) => {
    req.user = {
        id: "1",
        company_id: "1",
        name: "Amit"
    };
    next();
}
