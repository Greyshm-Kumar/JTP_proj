<h3>PLEASE MAKE SURE THAT PORTS 3000,80,5000 AND 5432 ARE NOT OCCUPIED BY OTHER PROCESSES.ALSO MAKE SURE THAT DOCKER DESKTOP ON YOUR COMPUTER IS RUNNING.ALSO MAKE SURE THAT PORT 5000 ON YOUR DOCKER CONTAINERS IS ALSO FREE</h3>

Commands for checking occupied ports on MAC

**sudo lsof -i -p -n | grep LISTEN** 

Commands for checking occupied ports on Windows

**netstat -a -n -o**

Go through the list thoroughly to check if all these ports are free. Thank you.

**The final commits of this project are** **restaurant-recommender7 and restaurant-recommender-offline**. All other commits were done while the project was still in the development phase.

**If you have any of the above-mentioned ports occupied and you do not want to kill the process a restaurant-recommender8 has been created which contains ports 3001,81,5001 and 5432**. These ports are generally uncommon but make sure that none of the processes on your machine are occupying these ports otherwise port issues may be caused.**Make sure port 5001 for your docker containers is also free.** **You will need internet access to run restaurant-recommender8.**

Clone this repository on your machine first. This will require internet access.

<h1>Installation</h1>

**Please make sure that your docker-desktop(docker-daemon) is running otherwise building the images is not possible.**

<h3>Without Internet Access</h3>

After cloning the repository go in the **restaurant-recommender-offline** directory. This is a large file as all the base images have been included inside the file in .tar file formats already and all dependencies have been packaged inside it so it can run smoothly without installing anything.

Here you will have to run a few commands to first load the base images on the docker daemon before utilizing them.

When you are inside the **restaurant-recommender-offline** directory run the following commands:

**docker load -i python-3.8-slim.tar**

**docker load -i postgres-13-alpine.tar**

**docker load -i nginx-alpine.tar**

These 3 commands will load the images on your docker daemon.

After this run the following commands to get your system up and running:

**docker-compose build**
**docker-compose up**

Visit http://localhost:3000 after this to access the UI. In this way you can run the whole system without internet access as well.

<h3>With Internet Access</h3>

Go into the command prompt and enter the **restaurant-recommender7 directory**. After you are in the directory run the command **docker-compose up --build**.  The project is plug and play and you do not have to install any dependencies. For understanding the code **restaurant_recommender7_labeled** has been created and this version has **modular and well commented code** for ease of understanding. This will need internet access for pulling base images from Docker.

<h1>How to operate</h1>

After the build is completed just go to http://localhost:3000 (http://localhost:3001 if you are using restaurant-recommeder8) to access the UI. This will land you on the homepage which will look like this:

![Screenshot(204).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(204).png?raw=true)

This is the homepage for the project. For example,the page will look somewhat like this:

![Screenshot(205).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(205).png?raw=true)

Next on the homepage you also have an option for searching the restaurants yourself.When you click on that page it will take you to a page where you can input your preferences and it will accordingly recommend restaurants based on your preferences.The search page looks like this:

![Screenshot(206).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(206).png?raw=true)

You can put some preferences and it will return results based on that. There are drop down menus for Cuisine and Price range.

![Screenshot(207).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(207).png?raw=true)

![Screenshot(208).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(208).png?raw=true)


In the price range you can manually enter the **MINIMUM RATING** for your preferences. Then click on **Find Restaurants** button and it will load the best possible restaurants that match your criteria. It will look like this:



![Screenshot(209).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(209).png?raw=true)

![Screenshot(210).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(210).png?raw=true)

![Screenshot(211).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(211).png?raw=true)

You can choose any of these options and it will give you all the information about the particular restaurant:


![Screenshot(212).png](https://github.com/Greyshm-Kumar/JTP_proj/blob/main/JTP_Screenshots/Screenshot%20(212).png?raw=true)


**Note**:The addresses and websites are fake.


<h1>Main feature of the project.</h1>

In this project, your clicks are continuously tracked and based on that user preferences are determined. **If you click on any of the search results or any of the recommendations on the homepage under the section “Recommended for you”, the recommendations on the homepage will change dynamically according to your click history.** 

**Note**:If you click on some restaurants and the recommendations do not change automatically, just refresh the page and you can see the changes. However, if you do not click on any of the results or recommendations then the results won’t change.

This is a prime application for the recommendation system that we were asked to design.

**Thank You**
