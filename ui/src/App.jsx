import React, { useEffect, useRef, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './App.css';
import { BsFillSunFill, BsMoonFill, BsFillBriefcaseFill, BsFillPeopleFill, BsCreditCard2FrontFill, BsPersonLinesFill } from "react-icons/bs";

const devMode = !window.invokeNative;

function App() {
  const [theme, setTheme] = useState('light');
  const [currentjob, setCurrentJob] = useState([])
  const appDiv = useRef(null);
  const [locales, setLocales] = useState([]);
  const [jobs, setJobs] = useState([]);

  const getLocale = (key) => locales[key] ?? key;

  const { setPopUp, setContextMenu, selectGIF, selectGallery, selectEmoji, fetchNui, sendNotification, getSettings, onSettingsChange, colorPicker, useCamera } = window;
  
  useEffect(() => {
    if (devMode) {
        document.getElementsByTagName('html')[0].style.visibility = 'visible';
        document.getElementsByTagName('body')[0].style.visibility = 'visible';
        return;
    } else {
        getSettings().then((settings) => setTheme(settings.display.theme));
        onSettingsChange((settings) => setTheme(settings.display.theme));
    }
}, []);

useEffect(() => {
  fetchNui("Jobcenter", { action: "getLocales" }).then((data) => {
    if (!data) return;
    setLocales(data)
  })

  fetchNui("Jobcenter", {
    action: "openJobs",
}).then((data) => {
    setCurrentJob(data.job);
    const jobsArray = JSON.parse(data.jobs);
    setJobs(jobsArray);
});


}, [])

  const handleJobRemove = (jobname, jobgrade) => {
    fetchNui("Jobcenter", {
      action: "RJob",
      name: jobname,
      grade: jobgrade,
  }).then((data) => {
    fetchNui("Jobcenter", {
      action: "openJobs",
  })
})
    const index = jobs.findIndex(job => job.name === jobname);
  
    if (index !== -1) {
      const updatedJobs = [...jobs];
      updatedJobs[index].fadeOut = true;
      setJobs(updatedJobs);
  
      setTimeout(() => {
        setJobs(prevJobs => prevJobs.filter(job => job.name !== jobname));
      }, 400);
    }
  };
  

  const handleJobSelect = (jobname,jobgrade) => {
    fetchNui("Jobcenter", {
      action: "SJob",
      name: jobname,
      grade: jobgrade,
  }).then((data) => {
      fetchNui("Jobcenter", {
        action: "openJobs",
    }).then((data) => {
        setCurrentJob(data.job);
        const jobsArray = JSON.parse(data.jobs);
        setJobs(jobsArray);
    });
})
};


  return (
    <AppProvider>
    <div className='app' ref={appDiv} data-theme={theme}>
      <div className='app-wrapper'>
        <div className='header'>
          <div className='title'>{getLocale("title")}</div>
        </div>
        <div className='jobs-container'>
          <div className='job-wrapper'>
            {Array.isArray(jobs) ? (
              jobs.map((job, index) => (
                <>
                  <div className={`item-holder ${job.fadeOut ? 'fade-out' : ''}`} key={index}>
                    <div className='item'>
                      <div className='left-item'>
                        <div className='job-info'>
                          <BsFillBriefcaseFill color='var(--text-primary)' />
                          <span className='job-navn'>{job.grade_label}</span>
                        </div>
                        <div className='extra'>
                          <div className='job-salary'>
                            <BsPersonLinesFill fontSize='12px' fontWeight="700"color='var(--text-secondary)' />
                            <span className='text left'>
                              {job.label}
                            </span>
                          </div>
                          <div className='job-salary'>
                            <BsCreditCard2FrontFill fontSize='12px' color='var(--text-secondary)' />
                            <span className='text left'>
                              {job.salary.toLocaleString('en-US')} DKK
                            </span>
                          </div>
                          <div className='job-online'>
                            <BsFillPeopleFill fontSize='12px' color='var(--text-secondary)' />
                            <span className='text left'>
                              {job.online}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='right-item'>
                        <div className='button-container'>
                          {currentjob.job === job.name ? (
                            <button className='choosen button-duty'>{getLocale("choosen")}</button>
                          ) : (
                            <>
                              {job.removable === true ? (
                                <>
                                  <button className='button-remove' onClick={() => handleJobRemove(job.name,job.grade)}>
                                    <FaTrash size="15px" color="white" opacity="0.8" />
                                  </button>
                                  <button className='button-duty notchoosen' onClick={() => handleJobSelect(job.name,job.grade)}>
                                    {getLocale("choose")}
                                  </button>
                                </>
                              ) : (
                                <button className='button-duty notchoosen' onClick={() => handleJobSelect(job.name,job.grade)}>
                                  {getLocale("choose")}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='line'></div>
                  </div>
                </>
              ))
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AppProvider>
  ) 
}

const AppProvider = ({ children }) => {
  if (devMode) {
      return <div className='dev-wrapper'>{children}</div>;
  } else return children;
};

const fetchData = (action, data) => {
  if (!action || !data) return;
  
  fetch(`https://${GetParentResourceName()}/${action}`, { // eslint-disable-line
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data)
}).then(resp => resp.json());
};

export default App
