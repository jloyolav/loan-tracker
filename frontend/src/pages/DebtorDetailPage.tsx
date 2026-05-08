import { Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

export default function DebtorDetailPage() {
  const { id } = useParams();

  return (
    <>
      <Heading mb={4}>Debtor #{id}</Heading>
      <Text color="gray.500">Transaction list coming soon.</Text>
    </>
  );
}
