local identifier = "react-js-template"
ESX = exports["es_extended"]:getSharedObject()

CreateThread(function ()
    while GetResourceState("lb-phone") ~= "started" do
        Wait(500)
    end

    local function AddApp()
        local added, errorMessage = exports["lb-phone"]:AddCustomApp({
            identifier = identifier,
            name = "Jobcenter",
            description = "App til at holde styr på dine jobs.",
            developer = "Lindholm",
            ui = GetCurrentResourceName() .. "/ui/dist/index.html",
            -- ui = "http://localhost:3000", -- dev version
            icon = "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/icon.png"
        })

        if not added then
            print("Could not add app:", errorMessage)
        end
    end

    AddApp()

    AddEventHandler("onResourceStart", function(resource)
        if resource == "lb-phone" then
            AddApp()
        end  
    end)
end)

RegisterNUICallback("Jobcenter", function(data,cb)
    ESX.TriggerServerCallback("Lindholm_job:getJobs", function(jobs)
        local playerJob = ESX.PlayerData.job
        local action = data.action
        local job = playerJob.name
        local grade = playerJob.grade

        if action == "openJobs" then
            cb({
                job = {job = job, grade = grade},
                jobs = json.encode(jobs)
            })
            
        elseif action == "SJob" then
            local job, grade = data.name, data.grade
            TriggerServerEvent("Lindholm_Job:changeJob", job, grade)
            cb("ok")
        elseif action == "RJob" then
            local job, grade = data.name, data.grade
            TriggerServerEvent("Lindholm_Job:removeJob", job, grade)
            cb("ok")
        end
    end)
end)

RegisterNetEvent("esx:setJob")
AddEventHandler(
    "esx:setJob",
    function(j)
        job = j.name
        grade = j.grade
        if Config.AutomatiskGem then
            TriggerServerEvent("Lindholm_Job:checkForJob")
        end
    end
)

function GetLocale(text)
    local locales = Locales[Config.Locale]
    if locales and locales[text] then
        return locales[text]
    end
    return text
end