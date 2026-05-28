from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, smls, client_needs, proposals, bot

app = FastAPI(title="ProxDeep API", version="1.0.0")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("VALIDATION ERROR payload:", await request.body())
    print("VALIDATION ERROR details:", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon/development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(smls.router, prefix="/api/smls", tags=["SMLs"])
app.include_router(client_needs.router, prefix="/api", tags=["Client Needs"])
app.include_router(proposals.router, prefix="/api", tags=["Proposals"])
app.include_router(bot.router, prefix="/api/bot", tags=["Bot"])

@app.get("/")
def read_root():
    return {"message": "ProxDeep API is running (Python FastAPI)"}
