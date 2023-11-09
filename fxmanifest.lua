fx_version "cerulean"
game "gta5"

title "LB Phone - Jobcenter"
description "Hold styr på dine jobs med en simpel app."
author "Lindholm"

shared_script '@es_extended/imports.lua'



lua54 'yes'

files {
    "ui/dist/**/*",
    "ui/icon.png"
}

client_scripts { 
    "client/client.lua",
}

shared_script { "config.lua", "locales.lua" }

server_scripts{
    '@mysql-async/lib/MySQL.lua',
    "server/server.lua",
}

ui_page "ui/dist/index.html"

