import Cookies from 'js-cookie';

export async function fetchGet(url) {
    return fetch(url, {credentials: 'include'});
}

export async function fetchPost(url, postBody) {
    let csrftoken = Cookies.get('csrftoken');
    let reqHeaders = new Headers();
    console.log("CHECK HEADERS", reqHeaders)
    console.log("CHECK HEADERS 2", csrftoken)
    if (csrftoken !== undefined) {
        reqHeaders.append('X-CSRFToken', csrftoken);
    }
    return fetch(
        url,
        {
            method: 'POST',
            body: postBody,
            credentials: 'include',
            headers: reqHeaders
        }
    );
}