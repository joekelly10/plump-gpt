export const getToolUseHTML = (tool_use) => {
    if (tool_use.name === 'web_search') {
        return `<div class='tool-use server-tool-use web-search'>
            <img class='icon web-search-icon' src='/img/icons/web-search-grey.png' alt='Web Search'>
            <div class='tool-use-text'>
                <div class='tool-use-label'>Searched for</div>
                <div class='tool-use-value'>${tool_use.input.query}</div>
            </div>
        </div>`
    }

    if (tool_use.name === 'google_search') {
        return `<div class='tool-use server-tool-use google-search'>
            <img class='icon google-search-icon' src='/img/icons/google-grey.png' alt='Google Search'>
            <div class='tool-use-text'>
                <div class='tool-use-label'>Searched for</div>
                <div class='tool-use-value'>${tool_use.grounding_metadata.webSearchQueries.join('<br />')}</div>
            </div>
        </div>`
    }

    if (tool_use.name === 'x_search') {
        return `<div class='tool-use server-tool-use x-search'>
            <img class='icon x-search-icon' src='/img/icons/x-grey.png' alt='X Search'>
            <div class='tool-use-text'>
                <div class='tool-use-label'>Citations</div>
                <div class='tool-use-value'>
                    ${tool_use.citations.map((citation, index) => `<a class='number-link' href='${citation}' title='${citation}' target='_blank'>${index + 1}</a>`).join(` <span class='bull'>•</span> `)}
                </div>
            </div>
        </div>`
    }

    return ''
}
