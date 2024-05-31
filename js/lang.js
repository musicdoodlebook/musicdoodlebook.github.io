import{createErrorElement,getCSSValueFromElement}from"./util.js";import{getSectionHideShowFunction,getFooterHideShowFunction}from"./util.js";import{embedNLatestVideo}from"./youtube.js";import{globalActiveSectionId}from"./navigation.js";const ERROR_OBJECT_KEY="--error-message";const ERROR_MESSAGE={ko:"오류",en:"ERROR",ja:"エラー"};function openLanguagePopup(){document.getElementById("language-popup").style.display="block";document.body.classList.add("modal-active");document.getElementById("popup-overlay").style.display="block"}function closeLanguagePopup(){document.getElementById("language-popup").style.display="none";document.body.classList.remove("modal-active");document.getElementById("popup-overlay").style.display="none"}async function handleLanguageChange(e){const button=e.target.closest(".language-button");if(button){const lang=button.getAttribute("data-lang");closeLanguagePopup();await changeLanguage(lang)}}async function changeLanguage(lang){const[hideHome,showHome]=getSectionHideShowFunction("home");const[hideMusic,showMusic]=getSectionHideShowFunction("music");const[hideDownload,showDownload]=getSectionHideShowFunction("download");const[hideFooter,showFooter]=getFooterHideShowFunction();function processHome(data){updateSectionDataI18N("#home",data);showHome()}async function processMusic(data){updateSectionDataI18N("#music",data);await embedNLatestVideo(lang);showMusic()}function processDownload(data){updateSectionDataI18N("#download",data);createDownlodSection(data.download.resources);showDownload()}const processFunctionMapping={home:processHome,music:processMusic,download:processDownload};function getLanguageProcessingOrder(activeSectionId){const sectionIds=["home","music","download"];const remainingSectionIds=sectionIds.filter(str=>str!==activeSectionId);return[activeSectionId,...remainingSectionIds]}const processOrder=getLanguageProcessingOrder(globalActiveSectionId);hideHome();hideMusic();hideDownload();hideFooter();try{const response=await fetch(`lang/${lang}.json`);if(!response.ok){throw new Error(`Failed to fetch language file: ${response.statusText}`)}const data=await response.json();document.documentElement.lang=lang;document.title=data.metadata.title;document.querySelector('meta[name="description"]').content=data.metadata.description;updateSectionDataI18N("nav",data);for(const sectionId of processOrder){processFunctionMapping[sectionId](data)}}catch(error){console.error("Error loading language file:",error);showHome();await embedNLatestVideo(lang);showMusic();createDownlodSection({[ERROR_OBJECT_KEY]:ERROR_MESSAGE[lang]});showDownload()}showFooter()}function updateSectionDataI18N(sectionQuery,data){document.querySelectorAll(`${sectionQuery} [data-i18n]`).forEach(element=>{const key=element.getAttribute("data-i18n");const keys=key.split(".");let text=data;keys.forEach(k=>{text=text[k]});element.innerText=text})}function createDownlodSection(data){const downloadSection=document.querySelector(".download-container");downloadSection.innerHTML="";const margin=getCSSValueFromElement(downloadSection,"font-size");const collapsibleSection=createCollapsibleSection(data,margin);downloadSection.appendChild(collapsibleSection)}function createCollapsibleSection(obj,margin="15px"){const fragment=document.createDocumentFragment();const sortedKeys=Object.keys(obj).sort();for(const key of sortedKeys){if(key===ERROR_OBJECT_KEY){const errorMessage=obj[key];const errorElement=createErrorElement(errorMessage);fragment.appendChild(errorElement)}else if(typeof obj[key]==="object"){const details=document.createElement("details");const summary=document.createElement("summary");summary.textContent=key;details.appendChild(summary);details.appendChild(createCollapsibleSection(obj[key],margin));details.style.marginLeft=margin;fragment.appendChild(details)}else{const link=document.createElement("a");link.href=obj[key];link.target="_blank";const icon=document.createElement("i");icon.classList.add("fa");const fileExtension=obj[key].split(".").pop().toLowerCase();switch(fileExtension){case"pdf":icon.classList.add("fa-file-pdf-o");break;case"mid":case"midi":icon.classList.add("fa-file-audio-o");break;case"mp3":case"wav":icon.classList.add("fa-file-audio-o");break;default:icon.classList.add("fa-file-o")}link.appendChild(icon);link.appendChild(document.createTextNode(" "+key));const container=document.createElement("div");container.style.marginLeft=margin;container.appendChild(link);fragment.appendChild(container)}}return fragment}async function setLanguageByBrowserSettings(){try{const userLang=navigator.language||navigator.userLanguage;let lang;if(userLang.startsWith("ko")){lang="ko"}else if(userLang.startsWith("ja")){lang="ja"}else{lang="en"}await changeLanguage(lang)}catch(error){console.error("Error setting language based on browser settings:",error);await changeLanguage("en")}}document.addEventListener("DOMContentLoaded",()=>{setLanguageByBrowserSettings();const languagePopup=document.getElementById("language-popup");languagePopup.addEventListener("click",handleLanguageChange);document.querySelectorAll(".language-selector").forEach(selector=>selector.addEventListener("click",e=>{e.preventDefault();openLanguagePopup()}));document.getElementById("popup-overlay").addEventListener("click",closeLanguagePopup)});