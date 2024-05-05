import './App.css'
import { CSVTable } from './components/csvTable'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
function App() {
  const queryClient = new QueryClient()


  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <CSVTable />
      </QueryClientProvider>

    </div>
  )
}

export default App
