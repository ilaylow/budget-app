// Taken from https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/
export function logOut(){
	localStorage.removeItem("token");
	localStorage.removeItem("refresh_token");
	localStorage.removeItem("user_ID");
	localStorage.removeItem("user_Type");
}

export function setWithExpiry(key, value, ttl) {
	const now = new Date()

	// `item` is an object which contains the original value
	// as well as the time when it's supposed to expire
	const item = {
		value: value,
		expiry: now.valueOf() + ttl,
	}
	localStorage.setItem(key, JSON.stringify(item))
}

export function getWithExpiry(key) {
	const itemStr = localStorage.getItem(key)

	// if the item doesn't exist, return null
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()

	// compare the expiry time of the item with the current time
	if (now.valueOf() > item.expiry) {
		console.log("Expired token!")
		// If the item is expired, delete the item from storage
		// and return null
		localStorage.removeItem(key)
		return null
	}
	return item.value
}