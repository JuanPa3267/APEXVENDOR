"""Static demo profile provider.

This module returns a fixed profile tuple for rendering in templates.
"""

import connector

# profile_info.py

# Initialize global variables with default empty values
usernameX = name = email = phone = role = country = city = linkedin = github = website = social_media = ""
score = 0


def set_profile(username: str):
    data = connector.get_profile(username)

    global usernameX, name, email, phone, role, score, country, city, social_media, website, linkedin, github
    usernameX = username
    name = data.get("name", "")
    email = data.get("email", "")
    phone = data.get("phone", "")
    role = data.get("role", "")
    score = data.get("score", 0)
    country = data.get("country", "")
    city = data.get("city", "")
    social_media = data.get("social_media", "")
    website = data.get("website", "")
    linkedin = data.get("linkedin", "")
    github = data.get("github", "")


def get_profile():
    roleX = "Proveedor" if role == 0 else "Cliente"
    return usernameX, name, email, phone, roleX, score, country, city, social_media, website, linkedin, github
