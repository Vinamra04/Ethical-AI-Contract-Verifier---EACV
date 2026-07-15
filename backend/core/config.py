from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        protected_namespaces=("settings_",),
    )

    supabase_url: str
    supabase_service_key: str
    gemini_api_key: str
    model_path: str = str(Path(__file__).parent.parent.parent / "Colab" / "ethical_risk_bundle.pkl")

settings = Settings()
