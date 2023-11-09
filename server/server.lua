local JobInfo = {}

ESX = exports["es_extended"]:getSharedObject()

MySQL.ready(
    function()
        MySQL.Async.fetchAll(
            "SELECT * FROM jobs WHERE 1",
            {},
            function(name)
                for _, v in ipairs(name) do
                    JobInfo[v.name] = {}
                    JobInfo[v.name].job_label = v.label
                    JobInfo[v.name].grades = {}

                    MySQL.Async.fetchAll(
                        "SELECT * FROM job_grades WHERE job_name = @job",
                        {["@job"] = v.name},
                        function(gradeInfo)
                            for __, g in ipairs(gradeInfo) do
                                JobInfo[v.name].grades[g.grade] = g
                            end
                        end
                    )
                end
            end
        )
    end
)

function AddJob(identifier, job, grade, rem)
    MySQL.Async.execute(
        "INSERT INTO `user_jobs`(`identifier`, `job`, `grade`, `removeable`) VALUES (@identifier, @job, @grade, @removeable)",
        {["@identifier"] = identifier, ["@job"] = job, ["@grade"] = grade, ["@removeable"] = rem}
    )
end

function RemoveJob(identifier, job, grade)
    MySQL.Async.execute(
        "DELETE FROM `user_jobs` WHERE identifier = @identifier AND job = @job AND grade = @grade",
        {["@identifier"] = identifier, ["@job"] = job, ["@grade"] = grade}
    )
end

ESX.RegisterServerCallback("Lindholm_job:getJobs",function(source, cb)
    local xPlayer = ESX.GetPlayerFromId(source)

    MySQL.Async.fetchAll(
        "SELECT * FROM user_jobs WHERE identifier = @identifier",
        {
            ["@identifier"] = xPlayer.identifier
        },
        function(jobs)
            local user_jobs = {}
            local online = {}

            local xPlayers = ESX.GetPlayers()

            for i = 1, #xPlayers, 1 do
                local targetPlayer = ESX.GetPlayerFromId(xPlayers[i])
                local targetJob = targetPlayer.getJob()
                if online[targetJob.name] ~= nil then
                    online[targetJob.name] = online[targetJob.name] + 1
                else
                    online[targetJob.name] = 1
                end
            end

            for _, v in ipairs(jobs) do
                local on = online[v.job]
                if on == nil then
                    on = 0
                end

                if JobInfo[v.job] == nil then
                    -- print('[Lindholm Jobcenter] Data fundet for job: ' .. v.job)
                else

                
                table.insert(
                    user_jobs,
                    {
                        name = v.job,
                        grade = v.grade,
                        label = JobInfo[v.job].job_label,
                        grade_label = JobInfo[v.job].grades[v.grade].label,
                        salary = JobInfo[v.job].grades[v.grade].salary,
                        online = on,
                        removable = v.removeable
                    }
                )
                end

            end

            for _, v in ipairs(Config.DefaultJobs) do
                local on = online[v.job]
                if on == nil then
                    on = 0
                end

                if JobInfo[v.job] ~= nil then
                    table.insert(
                        user_jobs,
                        {
                            name = v.job,
                            grade = v.grade,
                            label = JobInfo[v.job].job_label,
                            grade_label = JobInfo[v.job].grades[v.grade].label,
                            salary = JobInfo[v.job].grades[v.grade].salary,
                            online = on,
                            removable = false
                        }
                    )
                else
                    print(
                        "[Lindholm Jobcenter] Du har ikke et job med navnet " ..
                            v.job .. " i din config."
                    )
                end
            end

            cb(user_jobs)
        end
    )
end)

RegisterServerEvent("Lindholm_Job:addJob")
AddEventHandler(
    "Lindholm_Job:addJob",
    function(job)
        local src = source
        local xPlayer = ESX.GetPlayerFromId(src)

        AddJob(xPlayer.identifier, job, 0, true)
    end
)

function RemoveJob2(identifier, job)
    MySQL.Sync.execute(
         "DELETE FROM user_jobs WHERE identifier = @identifier AND job = @job",
         {["@identifier"] = identifier, ["@job"] = job}
     )
end


RegisterServerEvent("Lindholm_Job:removeJob")
AddEventHandler("Lindholm_Job:removeJob",function(job, grade)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)

    RemoveJob(xPlayer.identifier, job, grade)
end)

RegisterServerEvent("Lindholm_Job:changeJob")
AddEventHandler("Lindholm_Job:changeJob", function(job, grade)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)

    xPlayer.setJob(job, grade)
end)

RegisterServerEvent("Lindholm_Job:checkForJob")
AddEventHandler(
    "Lindholm_Job:checkForJob",
    function()
        local src = source
        local xPlayer = ESX.GetPlayerFromId(src)

        MySQL.Async.fetchAll(
            "SELECT * FROM user_jobs WHERE identifier = @identifier",
            {
                ["@identifier"] = xPlayer.identifier
            },
            function(jobs)
                local add = true
                local amount = 0

                local job = xPlayer.getJob()

                for _, v in ipairs(jobs) do
                    if job.name == v.job and job.grade == v.grade then
                      add = false
                  end
                   amount = amount + 1
               end

                for _, v in ipairs(Config.DefaultJobs) do
                    if job.name == v.job then
                        add = false
                    end
                end

                if add and amount < Config.MaxJobs and job.name ~= "offduty" then
                    RemoveJob2(xPlayer.identifier, job.name)
                    AddJob(xPlayer.identifier, job.name, job.grade, true)
               end
            end
        )
    end
)