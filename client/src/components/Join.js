import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flex, Box, Input, Button, Center } from '@chakra-ui/react'
const Join = () => {
  const [username, setUsername] = useState('')
  const [roomName, setRoomName] = useState('')

  return (
    <Flex
      w='100%'
      h='100vh'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
    >
      <Box>
        <Input
          placeholder='username'
          m='10px'
          onChange={(event) => {
            setUsername(event.target.value)
          }}
        />
        <Input
          placeholder='room'
          m='10px'
          onChange={(event) => {
            setRoomName(event.target.value)
          }}
        />
        <Center>
          <Link
            to={`chat/?username=${username}&room=${roomName}`}
            onClick={(event) => {
              if (!username || !roomName) {
                return event.preventDefault()
              }
              return null
            }}
          >
            <Button>Join</Button>
          </Link>
        </Center>
      </Box>
    </Flex>
  )
}

export default Join
