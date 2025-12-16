import { BsDatabaseCheck } from "react-icons/bs";
import { GrConfigure } from "react-icons/gr";
import { SiAuth0 } from "react-icons/si";
import { TbLogs } from "react-icons/tb";

export const painPoints = [
  {
    id: "cors-config",
    icon: GrConfigure,
    title: "Same CORS config",
    description: "Every project needs the same configurable CORS setup.",
  },
  {
    id: "database-init",
    icon: BsDatabaseCheck,
    title: "Same database init",
    description: "Only the env values change between projects.",
  },
  {
    id: "logging-setup",
    icon: TbLogs,
    title: "Same logging setup",
    description: "Winston, Morgan, or Pino—configured the same way every time.",
  },
  {
    id: "auth-boilerplate",
    icon: SiAuth0,
    title: "Same auth boilerplate",
    description: "JWT validation, session handling, middleware patterns.",
  },
];
