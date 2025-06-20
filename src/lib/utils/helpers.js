export const addCopyButtons = () => {
    const code_blocks = document.querySelectorAll('.message pre')

    code_blocks.forEach((block) => {
        let div = document.createElement('div')
        div.classList = 'copy-code'
        
        let button = document.createElement('button')
        button.classList = 'copy-code-button'
        button.innerText = 'Copy'

        block.appendChild(div)
        div.appendChild(button)

        button.addEventListener('click', async () => {
            clearTimeout(window.copy_code_timer)

            const code = block.querySelector('code').innerText
            await navigator.clipboard.writeText(code)

            button.innerText = 'Copied!'
            window.copy_code_timer = setTimeout(() => { button.innerText = 'Copy' }, 3000)
        })
    })
}

export const formatDate = (iso8601_string) => {
    const date = new Date(iso8601_string)

    if (lessThan7DaysAgo(date)) return timeAgo(date)
    
    const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month       = month_names[date.getMonth()]
    const hours       = date.getHours() % 12 || 12
    const minutes     = String(date.getMinutes()).padStart(2,'0')
    const meridiem    = date.getHours() < 12 ? 'am' : 'pm'
    
    return `${date.getDate()} ${month} ${date.getFullYear()} <span class='bull'>&bull;</span> ${hours}:${minutes}${meridiem}`
}

const lessThan7DaysAgo = (date) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return date.getTime() > sevenDaysAgo.getTime()
}

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ]
    
    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i]
        const count    = Math.floor(seconds / interval.seconds)
        
        if (count > 0) {
            if (interval.label === 'day') {
                const hours    = date.getHours() % 12 || 12
                const minutes  = String(date.getMinutes()).padStart(2,'0')
                const meridiem = date.getHours() < 12 ? 'am' : 'pm'

                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago <span class='bull'>&bull;</span> ${hours}:${minutes}${meridiem}` 
            }

            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
        }
    }
    
    return 'Just now'
}

export const insertIdIntoOrderedArray = (id, array) => {
    if (array.includes(id)) return
    const i = array.findIndex(el => el > id)
    if (i === -1) {
        array.push(id)
    } else {
        array.splice(i, 0, id)
    }
}

//  Used to ensure only one scroll animation per element
const active_smooth_scrolls = new WeakMap()

export const smoothScroll = (element, target_scrollTop, duration = 500, easing = 'quartOut') => {
    //  Clean up any existing animation for this element
    const cleanup = active_smooth_scrolls.get(element)
    if (cleanup) cleanup()

    const start      = element.scrollTop,
          distance   = target_scrollTop - start,
          start_time = performance.now()
    
    let animation_frame = null,
        is_interrupted  = false

    const handleWheel = (e) => {
        const scrolled_up = e.deltaY < 0
        if (scrolled_up && !is_interrupted) {
            is_interrupted = true
            cancelAnimationFrame(animation_frame)
            element.removeEventListener('wheel', handleWheel)
        }
    }

    element.addEventListener('wheel', handleWheel)

    // Store cleanup function for this element
    active_smooth_scrolls.set(element, () => {
        is_interrupted = true
        cancelAnimationFrame(animation_frame)
        element.removeEventListener('wheel', handleWheel)
    })

    const easing_functions = {
        cubicOut:   (t) => 1 - Math.pow(1 - t, 3),
        quartOut:   (t) => 1 - Math.pow(1 - t, 4),
        cubicInOut: (t) => t < 0.5 ? (4 * t * t * t)     : (1 - Math.pow(-2 * t + 2, 3) / 2),
        quartInOut: (t) => t < 0.5 ? (8 * t * t * t * t) : (1 - Math.pow(-2 * t + 2, 4) / 2),
    }

    const animateScroll = (current_time) => {
        if (is_interrupted) return

        const elapsed  = current_time - start_time,
              progress = Math.min(elapsed / duration, 1),
              min      = 0,
              max      = element.scrollHeight - element.clientHeight,
              raw      = start + (distance * easing_functions[easing](progress)),
              clamped  = Math.max(min, Math.min(max, raw))

        element.scrollTop = clamped

        if (progress < 1) {
            animation_frame = requestAnimationFrame(animateScroll)
        } else {
            element.removeEventListener('wheel', handleWheel)
            active_smooth_scrolls.delete(element)
        }
    }

    animation_frame = requestAnimationFrame(animateScroll)
}

export const cssSanitised = (string) => {
    const sanitised_string = string.replace(/[^\w-]/g, '_')

    // Check if it starts with a character sequence that isn't
    // allowed at the beginning of a CSS class name
    if (/^(\d|--|-\d)/.test(sanitised_string)) return `_${sanitised_string}`

    return sanitised_string
}
