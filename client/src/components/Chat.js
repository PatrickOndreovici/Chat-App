import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'
import ScrollToBottom from 'react-scroll-to-bottom'
import { FaCircle } from 'react-icons/fa'
import {
  Flex,
  Box,
  Textarea,
  Button,
  Icon,
  Center,
  useToast,
} from '@chakra-ui/react'
import date from 'date-and-time'

let socket
let timeout

const Chat = ({ location }) => {
  const [username, setUsername] = useState('')
  const [roomName, setRoomName] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [userTyping, setUserTyping] = useState('')
  const toast = useToast()
  useEffect(() => {
    const { username, room } = queryString.parse(location.search)
    socket = io('localhost:5000', { transports: ['websocket'] })

    socket.emit('join', { username, room })

    setUsername(username)
    setRoomName(room)

    socket.on('user left', (username) => {
      return toast({
        title: `${username} has left the room`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    })

    socket.on('user joined', (data) => {
      return toast({
        title: `${data.username} has joined to the room`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    })

    return () => {
      socket.off()
    }
  }, [])

  useEffect(() => {
    socket.on('message', (msj) => {
      setMessages([
        ...messages,
        { username: msj.username, text: msj.text, time: msj.time },
      ])
    })
    socket.on('typing', (username) => {
      setUserTyping(username)
    })

    socket.on('stoptyping', () => {
      setUserTyping('')
    })
  })

  const sendMessage = () => {
    socket.emit('message', message)
    const newMessages = [...messages]
    newMessages.push({
      username: username,
      text: message,
      time: date.format(new Date(), 'hh:mm A'),
    })
    setMessages([...newMessages])
    setMessage('')
  }

  return (
    <Flex h='100vh' justifyContent='center' align='center'>
      <Box w='40%'>
        <Flex
          w='100%'
          h='50px'
          borderRadius='lg'
          pl='10px'
          alignContent='center'
          justifyContent='space-between'
        >
          <Box>
            <Icon viewBox='0 0 200 200' color='green' mr='5px'>
              <path
                fill='currentColor'
                d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
              />
            </Icon>
            {roomName}
          </Box>
          <Box>{userTyping ? `${userTyping} is typing ...` : null}</Box>
        </Flex>
        <Flex
          bg='#d1d9d9'
          h='300px'
          w='100%'
          mb='10px'
          p='20px'
          borderRadius='lg'
          overflow='scroll'
          overflowX='hidden'
          flexDirection='column'
        >
          {messages.map((message, index) => {
            if (message.username === username) {
              return (
                <Box
                  m='5px'
                  bg='#3182CE'
                  w='80%'
                  p={4}
                  color='white'
                  alignSelf='flex-end'
                  borderRadius='lg'
                  key={`${index}`}
                >
                  <Box>
                    {message.username} {message.time}
                  </Box>
                  {message.text}
                </Box>
              )
            } else {
              return (
                <Box
                  m='5px'
                  bg='#325288'
                  w='80%'
                  p={4}
                  color='white'
                  alignSelf='flex-start'
                  borderRadius='lg'
                >
                  <Box>
                    {message.username} {message.time}
                  </Box>
                  {message.text}
                </Box>
              )
            }
          })}
        </Flex>
        <Flex>
          <Textarea
            flex='1'
            resize='none'
            size='lg'
            h='100px'
            value={message}
            onChange={(event) => {
              if (userTyping === '') {
                socket.emit('typing', username)
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                  socket.emit('stoptyping')
                }, 1000)
              }
              setMessage(event.target.value)
            }}
          ></Textarea>
          <Button
            w='120px'
            colorScheme='blue'
            h='100px'
            ml='10px'
            onClick={sendMessage}
          >
            Send
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

export default Chat
