// stub to be filled with our service interactions

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

const resultsEntries = document.querySelectorAll('.results');
const resultTriggers = [...resultsEntries].map(toggleResultDetails);

const searchEntries = document.querySelectorAll('.searchoptions');
const searchTriggers = [...searchEntries].map(dropSearchElement);

const searchTools = document.querySelectorAll('#newsearch');
const searchToolTriggers = [...searchTools].map(clearSearch);

function toggleResultDetails(e) {

    e.addEventListener("click", function (evt) {
        const targetParent = evt.target.parentNode.parentNode;

        if (evt.target.classList.contains("resultfold")) {
            const toggleElements = targetParent.querySelectorAll(".extra");

            evt.target.classList.toggle("bi-layer-backward");
            evt.target.classList.toggle("bi-layer-forward");
            [...toggleElements].map(togglable => togglable.hidden = !togglable.hidden);

            if (evt.target.classList.contains("bi-layer-backward")) {
                evt.target.setAttribute("data-bs-original-title", "Show Details");
            }
            else {
                evt.target.setAttribute("data-bs-original-title", "Hide Details");
            }
        }
    });
} 

function dropSearchElement(searchoptions) {
    searchoptions.addEventListener("click", function (evt) {

        var targetParent = evt.target.parentNode.parentNode;

        if (evt.target.classList.contains("optionclose"))  {
            targetParent.parentNode.removeChild(targetParent);

            // FIXME drop also the entry from the search record.
            // FIXME query the search results
        }
    });
} 

function clearSearch(searchoptions) {
    searchoptions.addEventListener("click", function (evt) {
        [...searchEntries].map(
            opts => {
                while (opts.firstChild) {
                    opts.removeChild(opts.firstChild);
                }
            }
        );

        // FIXME drop all entries from the search and display the default results
    });
} 
