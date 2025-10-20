"""profile_info.py — Adaptado a ApexVendor"""

import connector

# Valores por defecto globales
usernameX = name = email = phone = role = country = city = linkedin = github = website = social_media = ""
score = 0


def set_profile(username: str):
    data = connector.get_profile(username)
    if not data:
        # limpia si no hay datos
        _assign_defaults(username)
        return

    global usernameX, name, email, phone, role, score, country, city, social_media, website, linkedin, github
    usernameX = data.get("username", "")
    name = data.get("username", "").split("-")[1].capitalize()
    email = data.get("correo", "")
    phone = data.get("phone", "")
    role = data.get("role", "Sin rol")
    score = data.get("score", 0)
    country = data.get("country", "")
    city = data.get("city", "")
    social_media = data.get("instagram") or ""
    website = data.get("website") or ""
    linkedin = data.get("linkedin") or ""
    github = data.get("github") or ""


def get_profile():
    set_profile(usernameX)
    roleX = role
    return usernameX, name, email, phone, roleX, score, country, city, social_media, website, linkedin, github


def _assign_defaults(username: str):
    global usernameX, name, email, phone, role, score, country, city, social_media, website, linkedin, github
    usernameX = username
    name = email = phone = country = city = social_media = website = linkedin = github = ""
    role = "Sin rol"
    score = 0
