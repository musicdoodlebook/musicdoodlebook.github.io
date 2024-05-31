import{createErrorElement,getCSSCustomProperty}from"./util.js";const API_KEY="AIzaSyD_8iSLR8__ArOtOAWOOsTupiOiLBlm3Kg";const CHANNEL_HANDLE="@musicdoodlebook";const CHANNEL_URL=`https://www.youtube.com/${CHANNEL_HANDLE}`;const N_LATEST_VIDEOS=5;async function getUploadsPlaylistId(){try{const response=await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&forHandle=${CHANNEL_HANDLE}&part=contentDetails`);if(!response.ok){throw new Error(`HTTP error! status: ${response.status}`)}const data=await response.json();if(data.items&&data.items.length>0){const uploadsPlaylistId=data.items[0].contentDetails.relatedPlaylists.uploads;return uploadsPlaylistId}else{throw new Error("No channel found with the provided ID.")}}catch(error){console.error("Error fetching uploads playlist ID:",error);return null}}async function getNLatestVideo(n){const uploadsPlaylistId=await getUploadsPlaylistId();if(!uploadsPlaylistId){console.error("Unable to fetch uploads playlist ID.");return null}try{const response=await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${n}`);if(!response.ok){throw new Error(`HTTP error! status: ${response.status}`)}const data=await response.json();if(data.items&&data.items.length>0){return data.items}else{throw new Error("No videos found in the uploads playlist.")}}catch(error){console.error("Error fetching the latest video:",error);return null}}async function getVideoDetails(videoId,lang){try{const response=await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoId}&part=snippet&hl=${lang}`);if(!response.ok){throw new Error(`HTTP error! status: ${response.status}`)}const data=await response.json();if(data.items&&data.items.length>0){const snippet=data.items[0].snippet;const localizedTitle=snippet.localized.title||snippet.title;return{videoId:videoId,localizedTitle:localizedTitle}}else{throw new Error("No details found for this video.")}}catch(error){console.error("Error fetching video details:",error);return null}}function formatPublishedAt(publishedAt){const datePart=publishedAt.split("T")[0];const dateObject=new Date(publishedAt);const year=dateObject.getUTCFullYear();const month=String(dateObject.getUTCMonth()+1).padStart(2,"0");const day=String(dateObject.getUTCDate()).padStart(2,"0");const formattedDate=`${year}-${month}-${day}`;return formattedDate}async function embedNLatestVideo(lang,n=N_LATEST_VIDEOS){const items=await getNLatestVideo(n);const videos=document.getElementById("latest-videos");videos.innerHTML="";try{for(const item of items){const videoDetails=item.snippet;const videoId=videoDetails.resourceId.videoId;const publishedAt=videoDetails.publishedAt;if(!videoId){throw new Error("Error during embedding videos.")}const videoData=await getVideoDetails(videoId,lang);if(!videoData){throw new Error("Error during embedding videos.")}const{localizedTitle}=videoData;const videoDateElement=document.createElement("p");const videoTitleElement=document.createElement("p");const videoContainer=document.createElement("div");videoContainer.innerHTML=`
    <iframe id="ytplayer" type="text/html" width="560" height="315"
      src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&hl=${lang}&cc_lang_pref=${lang}&cc_load_policy=1&autoplay=0&controls=1"
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `;videoDateElement.textContent=formatPublishedAt(publishedAt);videoTitleElement.textContent=localizedTitle;videoContainer.classList.add("video-container");videos.appendChild(videoDateElement);videos.appendChild(videoTitleElement);videos.appendChild(videoContainer)}}catch(error){console.error(error);videos.appendChild(createErrorElement())}}async function fetchProfileInfo(){const url=`https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${CHANNEL_HANDLE}&key=${API_KEY}`;try{const response=await fetch(url);if(!response.ok){throw new Error(`Error fetching channel details: ${response.status}`)}const data=await response.json();if(!(data.items&&data.items.length>0)){throw new Error("Channel not found.")}const channelInfo=data.items[0].snippet;const profilePictureUrl=channelInfo.thumbnails.default.url;displayProfilePicture(profilePictureUrl)}catch(error){console.error(error)}}function displayProfilePicture(url){const container=document.querySelector("#profile-picture-container a");const img=document.createElement("img");img.src=url;img.alt="Profile Picture";img.onload=function(){const width=img.width;const height=img.height;const sidebarSize=parseInt(getCSSCustomProperty("--sidebar-size"),10);const imageSize=Math.min(img.width,img.height);const paddingSize=Math.max(0,(sidebarSize-imageSize)/2);img.style.padding=`${paddingSize}px 0px`};img.onerror=function(){console.error(`The image failed to load: ${url}. Default profile image will be used.`);img.src="img/default-profile.jpg";img.alt="Default Profile Picture"};container.appendChild(img)}function setLinkToYoutube(){document.querySelectorAll(".link-to-youtube").forEach(a=>{a.href=CHANNEL_URL;a.target="_blank"})}document.addEventListener("DOMContentLoaded",()=>{fetchProfileInfo();setLinkToYoutube()});export{embedNLatestVideo};