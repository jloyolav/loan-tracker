import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import DebtorDetailPage from "./pages/DebtorDetailPage";
import DebtorListPage from "./pages/DebtorListPage";

function AppBar() {
  return (
    <Flex as="header" bg="teal.600" px={6} py={4} align="center">
      <Link to="/">
        <Heading size="md" color="white">
          LoanTracker 💸
        </Heading>
      </Link>
    </Flex>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Box minH="100vh" bg="gray.50">
        <AppBar />
        <Container maxW="2xl" py={8}>
          <Routes>
            <Route path="/" element={<DebtorListPage />} />
            <Route path="/debtors/:id" element={<DebtorDetailPage />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}
