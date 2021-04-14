package handlers

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"qxp-web/server/pkg/contexts"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// ProxyAPIHandler proxy helper for endpoint api
func ProxyAPIHandler(w http.ResponseWriter, r *http.Request) {
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

	req.Header.Set("Content-Type", r.Header.Get("Content-Type"))
	req.Header.Set("User-Agent", r.Header.Get("User-Agent"))

	token := GetToken(r)
	req.Header.Set("Access-Token", token)

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
}

// todo
func ProxyWebsocket(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}
