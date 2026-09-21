import React from 'react';import{createRoot}from'react-dom/client';import App from'./App';import{company}from'./company';import'./index.css';
document.title=`${company.siteName} | Expert Fitness Video Courses`;document.querySelector('meta[name="description"]')?.setAttribute('content',`Expert-led ${company.siteName} fitness video courses for strength, mobility and energy.`);
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
