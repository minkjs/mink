# Mink Plugins

> Mink Plugins receive requests from your web browser and pass back reponses from the Mink server.

## The Basics

The following plugin output the `$uri` of the requested resource:

```javascript
const handler = $uri => new Promise(resolve => {
	const payload = {
		code: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: `<p>You requested the file: ${$uri}</p>`
	}

	resolve(payload)
})

const plugin = {
	handler
}

module.exports = mink => mink(plugin)
```


In the example above, the `$uri` is the absolute path of the resource being requested.



## Mink Handler Params

Your plugin handler is passed a set of magic-parameters from Mink, which help you write your requests.

You can write the Mink paramters in any order. Example:

```javascript
// Both parameter lists are passed the correct values by Mink
const handler = ($uri, $root) => {}
const handler = ($root, $uri) => {}
```

### Full List of Parameters

- `$uri` - The absolute path to the file resource requested
- `$root` - The directory that Mink is running the server.
- `$settings` - The current settings of the plugin.
- `$fileContents` - The contents of the requested resource.
- `$data` - Any `data` given your provided in your Minkconf.js file.
- `$req` - [HTTP Request object](https://nodejs.org/api/http.html#http_http_request_options_callback) from Node.
- `$res` - [HTTP Response object](https://nodejs.org/api/http.html#http_class_http_serverresponse) from Node.
- `$next` - The Node.js HTTP Next Request object.

### Parm `$uri`

The `$uri` is made up of two parts:

1. The `$root` from where you are running your server.
1. The `$url` that your browser requested.

