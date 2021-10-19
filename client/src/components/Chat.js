import React, { useState, useEffect, useCallback } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import { FaCircle } from "react-icons/fa";
import {
  Flex,
  Box,
  Textarea,
  Button,
  Icon,
  Center,
  useToast,
  Avatar,
  Stack,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import date from "date-and-time";
import { useHistory } from "react-router-dom";

let socket;
let timeout;

// Doing this project i learned that socket.on and socket.once are different
// Socket.on is for register a new handler for the given event.
// Socket.once is for event listeners only - when you only want to be notified of the next time an event occurs, not for the subsequent times it occurs.

const Chat = ({ location }) => {
  const { username, room } = queryString.parse(location.search);
  const [userID, setUserID] = useState(null);
  const toast = useToast();
  const history = useHistory();
  const [connectedUsers, setConnectedUsers] = useState([]); // store connected users
  const [messages, setMessages] = useState([]); // store messages

  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    // Create a connection between the client and the server
    socket = io("localhost:5000", { transports: ["websocket"] });
    socket.on("connect", () => {
      setUserID(socket.id);
    });
    socket.emit("join", { username, room });
    socket.on("disconnect", () => {
      history.push("/");
    })
    // destroy the socket, when user leave this page
    return () => {
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.once("user joined", (user) => {
      setConnectedUsers([...connectedUsers, user]);
    });
    socket.once("get users", (users) => {
      setConnectedUsers(users);
    });
  }, [connectedUsers, connectedUsers.length]);

  useEffect(() => {
    socket.once("message", (msj) => {
      setMessages([...messages, msj]);
    });
  }, [messages, messages.length]);

  const sendMessage = () => {
    socket.emit("message", currentMessage);
    setMessages([
      ...messages,
      {
        id: userID,
        username: username,
        text: currentMessage,
        time: date.format(new Date(), "hh:mm A"),
      },
    ]);
    setCurrentMessage("");
  };

  return (
    <div>
      <Flex h="100vh" justifyContent="center" align="center">

        <Stack mr="10px">
          {connectedUsers.map((user, index) => (
            <Menu>
              <MenuButton>
                <HStack>
                  <Avatar size="sm" src="https://bit.ly/broken-link" />
                  <Text>
                    {user.username} {index === 0 ? "(Admin)" : null}{" "}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => socket.emit("kick", {id: user.id, room: room})}>Kick</MenuItem>
              </MenuList>
            </Menu>
          ))}
        </Stack>

        <Box w="40%">
          <Flex
            w="100%"
            h="50px"
            borderRadius="lg"
            pl="10px"
            alignContent="center"
            justifyContent="space-between"
          >
            <Box>
              <Icon viewBox="0 0 200 200" color="green" mr="5px">
                <path
                  fill="currentColor"
                  d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                />
              </Icon>
              {room}
            </Box>
            <Box>{/*userTyping ? `${userTyping} is typing ...` : null*/}</Box>
          </Flex>
          <Flex
            bg="#d1d9d9"
            h="300px"
            w="100%"
            mb="10px"
            p="20px"
            borderRadius="lg"
            overflow="scroll"
            overflowX="hidden"
            flexDirection="column"
          >
            {messages.map((message, index) => {
              if (message.id === userID) {
                return (
                  <Box
                    m="5px"
                    bg="#3182CE"
                    w="80%"
                    p={4}
                    color="white"
                    alignSelf="flex-end"
                    borderRadius="lg"
                    key={`${index}`}
                  >
                    <Box>
                      {message.username} {message.time}
                    </Box>
                    {message.text}
                  </Box>
                );
              } else {
                return (
                  <Box
                    m="5px"
                    bg="#325288"
                    w="80%"
                    p={4}
                    color="white"
                    alignSelf="flex-start"
                    borderRadius="lg"
                  >
                    <Box>
                      {message.username} {message.time}
                    </Box>
                    {message.text}
                  </Box>
                );
              }
            })}
          </Flex>
          <Flex>
            <Textarea
              flex="1"
              resize="none"
              size="lg"
              h="100px"
              value={currentMessage}
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
            ></Textarea>
            <Button
              w="120px"
              colorScheme="blue"
              h="100px"
              ml="10px"
              onClick={sendMessage}
            >
              Send
            </Button>
          </Flex>
        </Box>
      </Flex>
    </div>
  );
};

export default Chat;
