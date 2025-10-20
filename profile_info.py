"""profile_info.py — Adaptado a ApexVendor"""

import connector

# Valores por defecto globales
usernameX = name = email = status = instagram = linkedin = website = github = nombres_apellidos = id_nit = telefono = direccion = ciudad = portafolio_resumen = ""
score = 0


def set_profile(username: str):
    data = connector.get_profile(username)
    if not data:
        # limpia si no hay datos
        _assign_defaults(username)
        return

    global usernameX, name, email, status, instagram, linkedin, website, github, nombres_apellidos, id_nit, telefono, direccion, ciudad, portafolio_resumen, score
    
    usernameX = data[0]
    name = data[0].split("-")[1].capitalize()
    email = data[1]
    status = data[2]
    instagram = data[3] or ""
    linkedin = data[4] or ""
    website = data[5] or ""
    github = data[6] or ""
    nombres_apellidos = data[7]
    id_nit = data[8]
    telefono = data[9]
    direccion = data[10]
    ciudad = data[11]
    portafolio_resumen = data[12]
    score = data[13]


def get_profile():
    set_profile(usernameX)
    return usernameX, name, email, status, instagram, linkedin, website, github, nombres_apellidos, id_nit, telefono, direccion, ciudad, portafolio_resumen, score
