import { Flex, Box, Text, Spacer } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { Debtor } from "../types";
import { formatCurrency } from "../utils/format";
import { balanceColors } from "../utils/theme";

interface Props {
  debtor: Debtor;
}

export default function DebtorCard({ debtor }: Props) {
  return (
    <Link to={`/debtors/${debtor.id}`}>
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={4}
        bg="white"
        _hover={{ bg: "gray.50", cursor: "pointer" }}
        transition="background 0.15s"
      >
        <Flex>
          <Text fontWeight="semibold">{debtor.name}</Text>
          <Spacer />
          <Text
            fontWeight="semibold"
            color={
              debtor.balance >= 0
                ? balanceColors.positive
                : balanceColors.negative
            }
          >
            {formatCurrency(debtor.balance)}
          </Text>
        </Flex>
      </Box>
    </Link>
  );
}
