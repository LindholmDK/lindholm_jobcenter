import React, { useEffect, useRef, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './App.css';
import { BsFillSunFill, BsMoonFill, BsFillBriefcaseFill, BsFillPeopleFill, BsCreditCard2FrontFill, BsPersonLinesFill } from "react-icons/bs";

const devMode = !window.invokeNative;

function App() {
  const [theme, setTheme] = useState('light');
  const [currentjob, setCurrentJob] = useState([])
  const appDiv = useRef(null);
  const [jobs, setJobs] = useState([]);


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
          <div className='title'>Jobcenter</div>
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
                          <span className='job-navn'>{job.label}</span>
                        </div>
                          <div className='job-salary'>
                            <span className='text'>
                              {job.grade_label}
                            </span>
                        </div>
                      </div>
                      <div className='under-item'>
                        <div className='button-container'>
                          {currentjob.job === job.name ? (
                            <button className='choosen button-duty button'>Valgt</button>
                          ) : (
                            <>
                              {job.removable === true ? (
                                <>
                                  <button className='button-remove button' onClick={() => handleJobRemove(job.name,job.grade)}>
                                    <FaTrash size="15px" color="white" opacity="0.8" />
                                  </button>
                                  <button className='button-duty choosen button' onClick={() => handleJobSelect(job.name,job.grade)}>
                                    Vælg
                                  </button>
                                </>
                              ) : (
                                <button className='button-duty choosen button' onClick={() => handleJobSelect(job.name,job.grade)}>
                                  Vælg
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
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
