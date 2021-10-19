import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  Flex,
  Box,
  Input,
  Button,
  Center,
  Stack,
  Text,
} from "@chakra-ui/react";
const Join = () => {
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");

  return (
    <Center h="100vh">
      <Stack spacing={3} w="30%">
        <Input
          placeholder="Username"
          size="md"
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <Input
          placeholder="Room name"
          size="md"
          onChange={(event) => {
            setRoomName(event.target.value);
          }}
        />
        <Link
          to={`chat/?username=${username}&room=${roomName}`}
          onClick={(event) => {
            if (!username || !roomName) {
              return event.preventDefault();
            }
            return null;
          }}
        >
          <Button>Join</Button>
        </Link>
      </Stack>
    </Center>
  );
};

export default Join;
