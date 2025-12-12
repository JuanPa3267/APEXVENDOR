try:
    print("Importing utils...")
    import core.utils
    print("Importing config...")
    import core.config
    print("Importing auth service...")
    import services.auth_service
    print("Importing profile service...")
    import services.profile_service
    print("Importing chat service...")
    import services.chat_service
    
    print("Importing routers.auth...")
    import routers.auth
    print("Importing routers.profile...")
    import routers.profile
    print("Importing routers.chat...")
    import routers.chat
    print("Importing routers.admin...")
    import routers.admin
    
    print("Importing main...")
    import main
    print("All good!")
except Exception as e:
    import traceback
    traceback.print_exc()
