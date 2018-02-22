# ExtTools-Comments
This plugin add commenting functionality as a section for Documents in NewsBoard.
The thread is voluntarily made simple (no comment thread) in order to make it easier to read chronologically how the story develops.
Note that Notifification mechanism (email or other) is not managed by this plugin.

#Educational purpose
The goal here is to provide a simple yet functional sample project that can easily be forked also by casual developers:
- No build process needed, just copy/paste (see How-to section below)
- Maintain look and feel using semantic UI
- Supports all modern Browsers, including necessary  polyfills for IE11+
- A single, easy to read file (main.js) with all the functional implementation to play with. Just leave the rest as it is and it should "just work"
- Configuration via a simple config.js file

#How-to
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
  
  

