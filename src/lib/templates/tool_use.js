export const getToolUseHTML = (tool_use) => {
    if (tool_use.type === 'server_tool_use') {
        if (tool_use.name === 'web_search') {
            return `<div class='tool-use server-tool-use web-search'>
                <div class='icon web-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Searched for</div>
                    <div class='tool-use-value'>${tool_use.input.query}</div>
                </div>
            </div>`
        } else if (tool_use.name === 'google_search') {
            return `<div class='tool-use server-tool-use google-search'>
                <div class='icon google-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Searched for</div>
                    <div class='tool-use-value'>${tool_use.grounding_metadata.webSearchQueries.join('<br />')}</div>
                </div>
            </div>`
        } else if (tool_use.name === 'x_search') {
            return `<div class='tool-use server-tool-use x-search'>
                <div class='icon x-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Citations</div>
                    <div class='tool-use-value'>
                        ${tool_use.citations.map((citation, index) => `<a class='number-link' href='${citation}' title='${citation}' target='_blank'>${index + 1}</a>`).join(` <span class='bull'>•</span> `)}
                    </div>
                </div>
            </div>`
        }
    } else if (tool_use.type === 'mcp_tool_use') {
        if (tool_use.name === 'deep_researcher_start') {
            let value
            if (tool_use.result) {
                value = tool_use.result.content.instructions
            } else {
                value = tool_use.input.query
            }
            return `<div class='tool-use mcp-tool-use exa-search deep-researcher-start'>
                <div class='icon exa-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Deep Research</div>
                    <div class='tool-use-value'>${value}</div>
                </div>
            </div>`
        } else if (tool_use.name === 'web_search_exa') {
            return `<div class='tool-use mcp-tool-use exa-search web-search-exa'>
                <div class='icon exa-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Web Search</div>
                    <div class='tool-use-value'>${tool_use.input.query}</div>
                </div>
            </div>`
        } else if (tool_use.name === 'company_research') {
            return `<div class='tool-use mcp-tool-use exa-search company-research'>
                <div class='icon exa-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Company Research</div>
                    <div class='tool-use-value'>...</div>
                </div>
            </div>`
        } else if (tool_use.name === 'crawling') {
            return `<div class='tool-use mcp-tool-use exa-search crawling'>
                <div class='icon exa-search-icon'></div>
                <div class='tool-use-text'>
                    <div class='tool-use-label'>Crawling</div>
                    <div class='tool-use-value'>...</div>
                </div>
            </div>`
        }
    }

    return ''
}
