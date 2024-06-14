"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, userStory = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  

  return $(`
      <li id="${story.storyId}">
        ${userStory ? getTrashCanHTML() : ""}
        ${currentUser ? getBookmarkHTML(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// Creates HTML for bookmark icon
function getBookmarkHTML(story){
  let iconStyle = "";
  if (currentUser.favorites.some(s => s.storyId === story.storyId)) {
    iconStyle = "fa-solid";
  } else {
    iconStyle = "fa-regular";
  }

  return `<i class="${iconStyle} fa-bookmark"></i>`;
}

// Creates HTML for trash can icon
function getTrashCanHTML(){
  return `<i class="fa-solid fa-trash-can"></i>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // grab info from the submission form
  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();
  const storyData = {title, author, url};

  await storyList.addStory(currentUser, storyData);
  putStoriesOnPage();

  $submitForm.slideUp();
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

async function deleteStory(evt) {
  // TODO
  // get the storyId from the clicked story
  const $target = $(evt.target);
  const $storyLi = $target.parent();
  const storyId = $storyLi.attr("id");
  
  await storyList.removeStory(currentUser, storyId);

  hidePageComponents();
  putUserStoriesOnPage();
}

$storiesLists.on("click", ".fa-trash-can", deleteStory);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $myStories.empty();

  // if cuurent users stories is empty, display a message
  if (currentUser.ownStories.length === 0) {
    $myStories.append("<h5>You have not submitted any stories</h5>");
  } else { // loop through current user stories and add to $myStories
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }

  $myStories.show();

}

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $myFavorites.empty();
  if (currentUser.favorites.length === 0) {
    $myFavorites.append("<h5>You do not have any favorited stories</h5>");
  } else {
    for (let story of currentUser.favorites) {
      let $story = generateStoryMarkup(story);
      $myFavorites.append($story);
    }
  }
  $myFavorites.show();
}

async function toggleFavorite(evt) {
  console.debug("toggleFavorite");

  const $target = $(evt.target);
  const $storyLi = $target.parent();
  const storyId = $storyLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // check if target is already a favorite, then toggle status
  if (currentUser.favorites.some(s => s.storyId === storyId)) {
    await currentUser.addOrRemoveFavorite("remove", story);
    $target.toggleClass(["fa-solid", "fa-regular"])
  } else {
    await currentUser.addOrRemoveFavorite("add", story);
    $target.toggleClass(["fa-solid", "fa-regular"]);
  }
}

$storiesLists.on("click", ".fa-bookmark", toggleFavorite);
$storiesLists.on("mouseenter mouseleave", ".fa-bookmark", function(){
  $(this).toggleClass(["fa-solid", "fa-regular"]);
});