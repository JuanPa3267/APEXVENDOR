"""Static demo profile provider.

This module returns a fixed profile tuple for rendering in templates.
"""


def get_profile(username: str = None):
    """Return a static profile tuple; ignores username for now."""
    if username is None:
        name = "Cristian Gomez"
        email = "cristianz20nw@gmail.com"
        phone = "+57 302-491-0408"
        role = "admin"
        score = 4.5
        country = "Colombia"
        city = "Bogotá"
        social_media = "https://www.instagram.com/cr15t14ng_/"
        website = "https://gomezgomez.website/"
        linkedin = "https://www.linkedin.com/in/cristian-g%C3%B3mez-971261338/"
        github = "https://github.com/cristianznw"
    return name, email, phone, role, score, country, city, social_media, website, linkedin, github
