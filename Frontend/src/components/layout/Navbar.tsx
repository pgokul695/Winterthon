import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface Props {
  window?: () => Window;
  currentPage: "pdf" | "video";
  setCurrentPage: (page: "pdf" | "video") => void;
  model: string;
  setModel: (model: string) => void;
}

const drawerWidth = 240;
const navItems = ["PDF", "Video"];

export default function DrawerAppBar({
  window,
  currentPage,
  setCurrentPage,
  model,
  setModel,
}: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MindCue
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => setCurrentPage(item.toLowerCase() as "pdf" | "video")}
            >
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Model selection in drawer */}
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Question Generator:
        </Typography>
        <Select
          fullWidth
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <MenuItem value="gemma3:latest">Gemma</MenuItem>
          <MenuItem value="llama3">LLaMA</MenuItem>
          <MenuItem value="ollama">Ollama</MenuItem>
        </Select>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav" color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center", display: { xs: "none", sm: "block" } }}
          >
            MindCue
          </Typography>

          {/* Desktop nav buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2, alignItems: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item}
                variant={currentPage === item.toLowerCase() ? "contained" : "text"}
                color="secondary"
                onClick={() => setCurrentPage(item.toLowerCase() as "pdf" | "video")}
              >
                {item}
              </Button>
            ))}
            {/* Model selection */}
            <Select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              sx={{ ml: 2, color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
            >
              <MenuItem value="gemma3:latest">Gemma</MenuItem>
              <MenuItem value="llama3">LLaMA</MenuItem>
              <MenuItem value="ollama">Ollama</MenuItem>
            </Select>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}
