fx_version "cerulean"
game "gta5"

title "LB Phone - Jobcenter"
description "Hold styr på dine jobs med en simpel app."
author "Lindholm"

shared_script '@es_extended/imports.lua'

lua54 'yes'

escrow_ignore {
    'config.lua',
    'locales.lua',
    'client/client.lua',
    'server/server.lua',
  }

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
-- ui_page "http://localhost:3000"

