from os import getenv

def get_db_url() -> str:
    return getenv("DATABASE_URL")
