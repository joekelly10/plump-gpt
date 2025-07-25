export const getToolUseHTML = (tool_use) => {
    if (tool_use.name === 'web_search') {
        return `<div class='tool-use server-tool-use web-search'>
            <img class='icon web-search-icon' src='/img/icons/web-search-grey.png' alt='Web Search'>
            <div class='tool-use-text'>
                <div class='tool-use-label'>Searched for:</div>
                <div class='tool-use-value'>${tool_use.input.query}</div>
            </div>
        </div>`
    }

    return ''
}
