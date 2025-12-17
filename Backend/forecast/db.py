from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv("DATABASE_URL")

if raw_url and "?schema=" in raw_url:
    raw_url = raw_url.split("?schema=")[0]

engine = create_engine(raw_url)