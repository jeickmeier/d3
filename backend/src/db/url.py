from os import environ


def get_db_url() -> str:
    return environ["DATABASE_URL"]
