// for detecting URL similarity https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
// https://www.npmjs.com/package/string-similarity

songList = [];


async function importBookmarksHTML(file) {
    // {title: title, dateCreated: dateCreated, icon: icon, url: url}
    var reader = new FileReader();
    reader.onload = async function(e) {
        var html = e.target.result;
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var aTag = doc.getElementsByTagName("a");
        for (var i = 0; i < aTag.length; i++) {
            var title = aTag[i].innerHTML;
            var dateCreated = aTag[i].getAttribute("add_date");
            var icon = aTag[i].getAttribute("icon");
            var url = aTag[i].getAttribute("href");
            songList.push({title: title, dateCreated: dateCreated, icon: icon, url: url});
        }
        console.log("Imported bookmarks from HTML file");
        console.log(songList);
        filterSongs();
    };
    reader.readAsText(file);
}
document.getElementById("bookmarkHTMLimport").addEventListener("change", function() {
    var file = this.files[0];
    importBookmarksHTML(file);
});

function filterSongs() {
    // filter #1 - remove entries that don't have a hash in the URL, that are longer than 20 characters
    songList = songList.filter(song => song.url.includes("#") && song.url.split('#')[1].length > 20);

    // filter #2 - remove entries that don't have four 0s in a row in the hash
    songList = songList.filter(song => song.url.split('#')[1].includes("0000"));

    console.log("Filtered songs");
    console.log(songList);

    groupVersions();
}

function groupVersions() {
    // using diceCoefficient("healed", "sealed")
    // scan through each song's title, compare it to all songs with diceCoefficient > 0.5
    // if a match is found, make the song an array itself, and move the match into it, then remove the match from the main array. continue until no matches are found
    // then move on to the next song

    for (let i = 0; i < songList.length; i++) {
        let song = songList[i];
        let group = [song];
        for (let j = i + 1; j < songList.length; j++) {
            let comparisonSong = songList[j];
            let similarity = stringSimilarity.compareTwoStrings(song.title, comparisonSong.title);
            if (similarity > 0.8) {
                group.push(comparisonSong);
                songList.splice(j, 1);
                j--; // Adjust the inner loop index since we removed an element
            }
        }
        songList[i] = group;
    }

    console.log("Grouped songs");
    console.log(songList);

    displaySongs();
}

/* html:

<div id="songs">
            <div class="song">
                <h2>Song Title</h2>
                <p>Song info</p>
                <a href="https://example.com/">Link</a>
            </div>
        </div>
*/
function displaySongs() {
    var songsDiv = document.getElementById("songs");
    songsDiv.innerHTML = ""; // Clear previous content
    for (let i = 0; i < songList.length; i++) {
        var songGroup = songList[i];
        var song = songGroup[0];
        var songDiv = document.createElement("div");
        songDiv.classList.add("song");
        var title = document.createElement("h2");
        title.innerHTML = song.title;
        songDiv.appendChild(title);
        var info = document.createElement("p");
        info.innerHTML = "Number of versions: " + songGroup.length;
        songDiv.appendChild(info);

        // Create a list of versions
        var versionList = document.createElement("ul");
        for (let j = 0; j < songGroup.length; j++) {
            var versionItem = document.createElement("li");
            var versionLink = document.createElement("a");
            versionLink.href = songGroup[j].url;
            versionLink.innerHTML = songGroup[j].title;
            versionItem.appendChild(versionLink);
            versionList.appendChild(versionItem);
        }
        songDiv.appendChild(versionList);

        songsDiv.appendChild(songDiv);
    }
}