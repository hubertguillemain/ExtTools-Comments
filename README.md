# ExtTools-Comments
Comments section for Documents in NewsBoard

#How to
1. Download the whole package:
  - As zip from gihub web app
  - use git clone

2. Place the "comments" folder on your IIS server. 
  - either at the root of your Web site, or below your OpenMedia Web app
  - convert it to an APP
  - Make sure the apppool has sufficient privileges on the folder.

3. Configure the config/config.js file for field mappings
- Make sure to choose fields which do not have random data in it. The plugin expects to find either it's own json data structure, or null

4. In the Admin Tool, configure this external tool 
  - Access mode: NewsBoard / Template / Section
  - If you can, always use relative paths for the main Content URL
  - If you can make sure to use a fallback URL as absolute path
  
  

