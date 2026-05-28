def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    columns = [col.name for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor):
    """Return a single row from a cursor as a dict, or None if no rows."""
    row = cursor.fetchone()
    if row is None:
        return None
    columns = [col.name for col in cursor.description]
    return dict(zip(columns, row))
