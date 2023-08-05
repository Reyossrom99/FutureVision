
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CollectionsTwoToneIcon from '@mui/icons-material/CollectionsTwoTone';
import EqualizerRoundedIcon from '@mui/icons-material/EqualizerRounded';
import ModelTrainingRoundedIcon from '@mui/icons-material/ModelTrainingRounded';
export const navData = [
    {
        id: 0,
        icon: <CollectionsTwoToneIcon/>,
        text: "Datasets",
        link: "datasets"
    },
    {
        id: 1,
        icon: <ModelTrainingRoundedIcon/>,
        text: "Models",
        link: "models"
    },
    {
        id: 2,
        icon: <EqualizerRoundedIcon/>,
        text: "Statistics",
        link: "statistics"
    },
    {
        id: 3,
        icon: <SettingsRoundedIcon/>,
        text: "Settings",
        link: "settings"
    },
]