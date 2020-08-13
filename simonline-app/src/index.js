import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'

import { Provider } from './components/ContextProvider'
import { HashRouter as Router } from 'react-router-dom'

ReactDOM.render(
    <Provider>
        <Router>
            <App />
        </Router>
    </Provider>
    ,document.getElementById('root')
)

serviceWorker.unregister()
