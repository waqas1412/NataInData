export interface LessonData {
  id: number;
  section: string;
  image?: string;
}

export const lessonData: LessonData[] = [
  {
    "id": 1,
    "section": "Alright, data enthusiast\\! Let's embark on this exciting journey through the world of data engineering. I've tailored this course into 30 days of learning modules, each packed with bite-sized chunks of data goodness. Buckle up, because we're about to turn you into a data modeling wizard\\! \ud83e\uddd9\u200d\u2642\ufe0f\ud83d\udcbe"
  },
  {
    "id": 2,
    "section": "# Day 0-7: Computer Science Fundamentals\n\nNote: If you're completely new to the world of Computer Science (which is perfectly fine, we've all been there), I highly recommend Harvard's CS50 Introduction to Computer Science on YouTube. David Malan delivers a charismatic, engaging, and passionate exploration of all the fundamentals of CS, accompanied by practical examples. I would give it a solid 10/10.  \nHere is the link: [https://www.youtube.com/watch?v=IDDmrzzB14M\\&list=PLhQjrBD2T380F\\_inVRXMIHCqLaNUd7bN4\\&ab\\_channel=CS50](https://www.youtube.com/watch?v=IDDmrzzB14M&list=PLhQjrBD2T380F_inVRXMIHCqLaNUd7bN4&ab_channel=CS50)\n\nThe main concepts you need to know are: GIT, APIs, CLI, Structured & Unstructured data, SSH, Linux, Shell scripting, Cron jobs",
  },
  {
    "id": 3,
    "section": "## Module 1: GIT \n\nWhat it is: GIT is like that magical \"Undo\" button you wish you had in life, but for code. It\u2019s a version control system that tracks your changes and helps you collaborate with others without stepping on their toes (or code).\n\nWhat you need to know:\n\n* Basic commands like `clone`, `commit`, `push`, and `pull`.  \n* How to create and merge branches. (No, not tree branches, but kind of similar in concept.)  \n* Resolve conflicts when your coworker\u2019s code doesn\u2019t play nice with yours.\n\n**Why it matters:** In data engineering, your code and pipelines are always evolving. GIT ensures you don\u2019t accidentally delete the entire database schema at 2 AM (we\u2019ve all been there).\n\nWhat You Need to Know in GIT\n\n#### 1\\. Basic Workflow Commands\n\nThese are the bread and butter of GIT.\n\n* **`git init`**: Start tracking changes in a folder. It creates a `.git` folder.  \n  *Think of it as planting the GIT flag to claim your territory.*  \n* **`git add <file>`**: Stage your changes, preparing them for a snapshot.  \n* **`git commit -m \"message\"`**: Save a snapshot of your work with a message.  \n* **`git status`**: See what\u2019s changed or what\u2019s staged for commit.  \n  *Your personal assistant for what\u2019s going on in your repo.*  \n* **`git log`**: View the history of commits.\n\n#### **2\\. Collaborating with Repositories**\n\n* **`git clone <repo-url>`**: Copy a remote repository to your local machine.  \n  *Like downloading your friend\u2019s homework but legally.*  \n* **`git pull`**: Update your local repository with changes from the remote.  \n  *Fetching the latest gossip from the team repo.*  \n* **`git push`**: Upload your local commits to the remote repository.  \n  *Sharing your hard work with the world\u2014or at least your team.*\n\n#### **3\\. Branching and Merging**\n\nBranches let you work on new features or fixes without breaking the main code.\n\n* **`git branch <branch-name>`**: Create a new branch.  \n* **`git checkout <branch-name>`**: Switch to a different branch.  \n* **`git merge <branch-name>`**: Combine changes from one branch into another.  \n  *When your experimental recipe turns out great, you add it to the main menu.*  \n* **`git branch -d <branch-name>`**: Delete a branch.\n\n#### **4\\. Resolving Conflicts**\n\nWhen two people edit the same file in different ways, GIT asks you to resolve the conflict.\n\n* **Open the conflicted file**: GIT marks the conflicting sections.  \n* **Choose or combine changes**: Decide what stays and what goes.  \n* **Commit the resolved file**: Save the final version.\n\n---\n\n### **Advanced Commands (You\u2019ll Eventually Use)**\n\n* **`git stash`**: Temporarily save changes without committing. Useful if your boss interrupts you mid-flow.  \n* **`git rebase`**: Reorganize commit history to make it cleaner (like tidying your closet).  \n* **`git reset`**: Undo commits (carefully\\!).\n\n---\n\n### **Best Practices for GIT as a Data Engineer**\n\n1. **Commit Often:** Think of commits as diary entries\u2014you\u2019ll want to track your progress.  \n2. **Write Clear Commit Messages:** Use verbs: e.g., `Added`, `Fixed`, `Refactored`.  \n3. **Pull Before Pushing:** Always fetch the latest changes to avoid conflicts.  \n4. **Use Branches:** Never work directly on the `main` branch; it\u2019s sacred\n\nIf you want to practice, use this Free GIT game: https://profy.dev/project/github-minesweeper",
    "image": "./images/lessons/1-git.png"
  },
  {
    "id": 4,
    "section": "## Module 2:  APIs \u2013 Your Data's Delivery Guys\n\nWhat it is: APIs are like waiters\u2014they fetch data from somewhere else and deliver it to you. \n\n**What you need to know:**\n\n* How to send HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) using tools like Postman or Python.  \n* Understand JSON responses\u2014they\u2019re like the menu of what data you can get.  \n* Authentication (because some APIs are exclusive).\n\n**Why it matters:** APIs are often how you\u2019ll fetch external data for your pipelines. Knowing how to handle them will make you feel like the data whisperer.\n\nAs a data engineer, you\u2019ll encounter APIs when:\n\n* Pulling data from external systems (e.g., weather data, stock prices, or social media metrics).  \n* Sending data to other systems (e.g., uploading processed data to a dashboard).  \n* Automating tasks across different platforms.\n\n---\n\n### **What You Need to Know About APIs**\n\n#### **1\\. How APIs Work**\n\nThink of APIs as a conversation between you (the client) and a system (the server). You ask for something in a specific way, and if you\u2019re polite (follow the API rules), the server responds.\n\n##### **The Basics:**\n\n* **Request:** Your message to the server.  \n  Example: \u201cHey, can I get today\u2019s weather?\u201d  \n* **Response:** The server\u2019s reply.  \n  Example: \u201cSure, it\u2019s sunny with 25\u00b0C\\!\u201d\n\n##### **HTTP Requests:**\n\n* **GET:** Fetch data.  \n  *\u201cCan I have the latest stock prices?\u201d*  \n* **POST:** Send data.  \n  *\u201cHere\u2019s the new user I just created.\u201d*  \n* **PUT:** Update existing data.  \n  *\u201cChange my profile picture to this new one.\u201d*  \n* **DELETE:** Remove data.  \n  *\u201cPlease delete this old report.\u201d*"
  },
  {
    "id": 5,
    "section": "## Module 3: CLI (Command Line Interface) \u2013 The Black Box of Power\n\n**What it is:** The CLI is that intimidating black screen hackers use in movies (spoiler: it\u2019s not as cool as Hollywood makes it look).\n\n**What you need to know:**\n\n* Navigate files and directories (`ls`, `cd`, `mkdir`).  \n* Copy, move, and delete files (`cp`, `mv`, `rm`).  \n* Search for text in files with `grep` (a lifesaver for debugging).\n\n**Why it matters:** Data engineering often requires automating tasks. The CLI is faster and more efficient than clicking around like a lost puppy.\n\nAs a data engineer, you\u2019ll use the CLI to:\n\n* Manage files and directories.  \n* Interact with servers and databases.  \n* Run scripts and automate tasks.  \n* Debug pipelines and processes."
  },
  {
    "id": 6,
    "section": "## Module 4: Structured & Unstructured Data \n\n### \n\n### **What it is:** Structured data is your perfectly organized Excel sheet. Unstructured data is your camera roll with memes, selfies, and screenshots of recipes you\u2019ll never try.\n\n**What you need to know:**\n\n* How to work with structured data (think tables in databases).  \n* Handle unstructured data like logs, images, or social media feeds.  \n* Convert unstructured chaos into structured insights using tools like regex or natural language processing.\n\n**Why it matters:** You\u2019ll be dealing with all kinds of data. Knowing the difference helps you decide the tools and methods to process it."
  },
  {
    "id": 7,
    "section": "## Module 5: SSH \u2013 The Secure Key to Remote Machines\n\n**What it is:** SSH is like a long-distance relationship with servers\u2014it lets you connect to them securely from anywhere.\n\n**What you need to know:**\n\n* How to generate and use SSH keys for authentication.  \n* Login to remote servers (`ssh user@hostname`).  \n* Transfer files securely using `scp` or `rsync`.\n\n**Why it matters:** Data lives on servers, and SSH is your golden ticket to access them without anyone eavesdropping."
  },
  {
    "id": 8,
    "section": "## Module 6: Shell Scripting \u2013 Automation's Best Friend\n\n**What it is:** Shell scripts are like recipes\u2014they tell the computer what to do, step by step."
  },
  {
    "id": 9,
    "section": "## Module 7: Cron Jobs \u2013 Your Automated Alarm Clock\n\n**What it is:** Cron jobs are like setting a timer for your oven, but for scripts and commands.\n\n**What you need to know:**\n\n* Write cron expressions (`* * * * *` format) to schedule tasks.  \n* Automate tasks like data backups or running ETL pipelines.  \n* Debug why your job didn\u2019t run (spoiler: it\u2019s probably a typo)."
  },
  {
    "id": 10,
    "section": "# Day 7-9: SQL \u2013 The Language of Data\n\nSQL (Structured Query Language) is the bread and butter of data engineering. It\u2019s the language you use to talk to databases, and it\u2019s essential for extracting, transforming, and managing data. Whether you're building pipelines, running analyses, or optimizing storage, SQL is your go-to tool."
  },
  {
    "id": 11,
    "section": "# Day 10: **SQL vs NoSQL**\n\n### **SQL vs NoSQL \u2013 The Ultimate Database Showdown**\n\nWhen it comes to databases, you\u2019ve got two main contenders in the ring: **SQL (Structured Query Language)** and **NoSQL (Not Only SQL)**. Think of them like two superhero teams with different powers\u2014each great for specific scenarios."
  },
  {
    "id": 12,
    "section": "# Day 11-13: Foundations of Data Modeling\n\n## Module 1: What's the Big Deal About Data Modeling?\n\nEver tried to build a house without a blueprint? That's what working with data without a proper model is like. Let's dive into why data modeling is the superhero of the data world\\!"
  },
  {
    "id": 13,
    "section": "## Module 2: Entity-Relationship Diagrams (ERD) \\- Drawing Data Relationships\n\nNow that we know why data modeling is crucial, let's learn how to draw these data masterpieces. Enter the Entity-Relationship Diagram, or ERD for short."
  },
  {
    "id": 14,
    "section": "## Module 3: Normalization and Denormalization\n\n1. What is Normalization?: It's the process of organizing data to reduce redundancy and improve data integrity. Think of it as decluttering your data closet."
  },
  {
    "id": 15,
    "section": "## Module 4: Dimensional Modeling: Star Schema \n\nNow, we're diving into dimensional modeling, starting with the glamorous Star Schema."
  },
  {
    "id": 16,
    "section": "## Module 5: Snowflake Schema \\- Let It Snow, Let It Snow, Let It Snow\\!\n\nNow that we've mastered the star schema, let's make it snow with the snowflake schema."
  },
  {
    "id": 17,
    "section": "## Module 6: Slowly Changing Dimensions (SCDs) \\- When Change is the Only Constant\n\nGood morning, data time traveler\\! Today we're diving into the fascinating world of Slowly Changing Dimensions (SCDs). Buckle up, we're about to bend time\\!"
  },
  {
    "id": 18,
    "section": "## Module 7: Data Vault Modeling \\- The Swiss Army Knife of Data Modeling\n\nWelcome back, data vault hunter\\! Now we're going to explore Data Vault modeling, a flexible approach to handle complex and changing environments."
  },
  {
    "id": 19,
    "section": "## Module 8: One Big Table (OBT) \\- When Bigger is Better\n\nWelcome back, data maximalist\\! Now we're going to explore the One Big Table (OBT) approach, which is like the all-you-can-eat buffet of data modeling\\!"
  },
  {
    "id": 20,
    "section": "## Module 9: NoSQL Data Modeling \\- Breaking Free from Tables\n\nGood morning, data rebel\\! Today we're breaking free from the constraints of relational databases and diving into the wild world of NoSQL data modeling."
  },
  {
    "id": 21,
    "section": "## Module 10: Data Modeling for Data Lakes \\- Diving into the Data Deep End\n\nWelcome back, data lake lifeguard\\! Now we're going to explore how to model data for the vast and sometimes murky waters of data lakes."
  }
]; 