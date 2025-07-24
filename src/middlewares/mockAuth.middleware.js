export const mockAuth = (req,res,next) => {
    req.user = {
        id: "1",
        company_id: "c1",
        name: "Amit"
    };
    next();
}
