---
description: how to make the life update story public
---

This workflow describes how to make the `story.html` (Life update) page public on the website.

1.  **Modify `index.html`**:
    Uncomment the link to `story.html` in the "Now" section. 
    Look for:
    ```html
    <!-- <a href="story.html" class="link-highlight">Read the full story of how we got here →</a> -->
    ```
    And change it back to:
    ```html
    <a href="story.html" class="link-highlight">Read the full story of how we got here →</a>
    ```

2.  **Modify `script.js`**:
    Uncomment the "Now" link in the navigation menu initialization function (`initNavigation`).
    Look for:
    ```javascript
    // <li><a href="story.html" class="nav-link ${isStory ? 'active' : ''}">Now</a></li>
    ```
    And change it back to:
    ```javascript
    <li><a href="story.html" class="nav-link ${isStory ? 'active' : ''}">Now</a></li>
    ```

3.  **Verify**:
    Open the website in a browser and ensure the "Life update" story is accessible via both the homepage link and the navigation menu.
