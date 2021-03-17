package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"qxp-web/server/pkg/contexts"
)

// ProxyAPIHandler proxy helper for endpoint api
func ProxyAPIHandler(w http.ResponseWriter, r *http.Request) {
	// session, err := contexts.GetCurrentRequestSession(r)
	// if err != nil {
	// 	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	// 	return
	// }

	// token, ok := session.Values["token"].(string)
	// if !ok {
	// 	token = r.Header.Get("X-Auth-Token")
	// 	contexts.Logger.Debugf("no session key found for request: %s", contexts.GetRequestID(r))
	// }

	// if token == "" {
	// 	http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
	// 	return
	// }

	method := r.Method
	path := r.URL.Path
	url := ""
	if r.URL.RawQuery != "" {
		url = fmt.Sprintf("%s%s?%s", contexts.APIEndpoint, path, r.URL.RawQuery)
	} else {
		url = fmt.Sprintf("%s%s", contexts.APIEndpoint, path)
	}

	req, err := http.NewRequest(method, url, r.Body)
	if err != nil {
		contexts.Logger.Error("failed to build billing request: %s", err.Error())
		renderErrorPage(w, r, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	// authorization := "Bearer " + token
	// req.Header.Add("Authorization", authorization)
	req.Header.Set("Content-Type", r.Header.Get("Content-Type"))
	for key, values := range r.Header {
		for _, value := range values {
			if key != "Cookie" && key != "Origin" && key != "Referer" {
				req.Header.Set(key, value)
			}
		}
	}

	token, _ := contexts.GetSessionToken(r)
	if token != "" {
		req.Header.Set("Access-Token", token)
	}

	// headers: {
	//     token: '4cf02e712070455b92f4a95525768603',
	//     domain: 'qingcloud'
	//   }

	contexts.Logger.Debugf("proxy api request, method: %s, url: %s, header: %s request_id: %s", method, url, req.Header, contexts.GetRequestID(r))

	resp, err := contexts.HTTPClient.Do(req)
	if err != nil {
		contexts.Logger.Errorf("do request proxy error: %s, request_id: %s", err.Error(), contexts.GetRequestID(r))
		w.WriteHeader(500)
		w.Write([]byte("internal error"))
		return
	}
	defer resp.Body.Close()

	buffer := &bytes.Buffer{}
	_, err = io.Copy(buffer, resp.Body)
	if err != nil {
		contexts.Logger.Errorf("copy response body error: %s", err.Error())
		w.WriteHeader(400)
		w.Write([]byte("Bad Request"))
		return
	}

	w.Header().Add("Content-Type", resp.Header.Get("Content-Type"))
	w.WriteHeader(resp.StatusCode)
	w.Write(buffer.Bytes())
	return
}
