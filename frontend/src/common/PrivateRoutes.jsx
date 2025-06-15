import PilsatingDotesLoader from "@/components/ui/loaders/PilsatingDotesLoader";
import { PermissionsContext } from "@/contexts/PermissionsContext";
import { checkUserSession  } from "@/service/auth.service";
import { getClientData } from "@/service/user.service";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useContext } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";

export function PrivateRoutes() {
    const location = useLocation();
    const nav = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {updatePermissions} = useContext(PermissionsContext);

    const userCheckMutation = useMutation({
        mutationFn: checkUserSession ,
        onSuccess: () => {
            setIsAuthenticated(true);
            setIsLoading(false);
            clientDataGetMutation.mutate();
        },
        onError: (error) => {
            window.localStorage.removeItem('userData')
            nav('/login');
            console.error("Error while checking user token", error);
            setIsAuthenticated(false);
            setIsLoading(false);
        },
    });

    const clientDataGetMutation = useMutation({
        mutationFn: getClientData ,
        onSuccess: (res) => {
            updatePermissions(res?.data);
        },
        onError: (error) => {
            console.error("Error while getting user data", error);
        },
    });

    useEffect(() => {
        userCheckMutation.mutate();
    }, []);

    if (isLoading || clientDataGetMutation?.isPending) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PilsatingDotesLoader />
            </div>
        );
    }

    return (isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />);
}

export default PrivateRoutes;