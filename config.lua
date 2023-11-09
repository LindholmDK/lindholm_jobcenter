Config = {

	Locale = "da",
	AutomatiskGem = true,
	MaxJobs = 7,

	DefaultJobs = { -- Jobs som ikke kan fjernes
    	{job = 'unemployed', grade = 0},
	},

	OffdutyForEveryone = true, -- Everyone can go into offduty job
	JobsThatCanUseOffduty = { -- Jobs that can use offduty if option above is false
		'police',
		'ambulance',
		'advokat',
	},

}